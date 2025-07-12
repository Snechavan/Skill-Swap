import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  initializeAuth: () => void;
  createDemoUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        set({
          user: { ...userData, id: firebaseUser.uid },
          firebaseUser,
          isAuthenticated: true,
          loading: false
        });
      } else {
        // User exists in Firebase Auth but not in Firestore - create profile
        const newUser: Omit<User, 'id'> = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          skillsOffered: [],
          skillsWanted: [],
          availability: { weekends: false, evenings: false },
          isPublic: true,
          trustScore: 100,
          points: 0,
          badges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'user'
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        set({
          user: { ...newUser, id: firebaseUser.uid },
          firebaseUser,
          isAuthenticated: true,
          loading: false
        });
      }
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        skillsOffered: [],
        skillsWanted: [],
        availability: { weekends: false, evenings: false },
        isPublic: true,
        trustScore: 100,
        points: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ User profile created in Firebase:', {
        userId: firebaseUser.uid,
        userData: newUser
      });

      // Create a properly typed user for local state
      const userWithId: User = {
        ...newUser,
        id: firebaseUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set({
        user: userWithId,
        firebaseUser,
        isAuthenticated: true,
        loading: false
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      set({
        user: { ...user, ...updates, updatedAt: new Date() }
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({
              user: { ...userData, id: firebaseUser.uid },
              firebaseUser,
              isAuthenticated: true,
              loading: false
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          set({ loading: false });
        }
      } else {
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          loading: false
        });
      }
    });
  },

  createDemoUser: async () => {
    try {
      set({ loading: true, error: null });
      const email = 'demo@example.com';
      const password = 'demo123';
      const name = 'Demo User';

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error('Failed to create demo user: Firebase user is null');
      }

      // Create user profile in Firestore
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        skillsOffered: [
          {
            id: 'demo-skill-1',
            name: 'JavaScript',
            category: 'Programming',
            level: 'intermediate'
          },
          {
            id: 'demo-skill-2',
            name: 'React',
            category: 'Frontend',
            level: 'intermediate'
          }
        ],
        skillsWanted: [
          {
            id: 'demo-skill-3',
            name: 'Python',
            category: 'Programming',
            level: 'beginner'
          },
          {
            id: 'demo-skill-4',
            name: 'UI/UX Design',
            category: 'Design',
            level: 'beginner'
          }
        ],
        availability: { weekends: true, evenings: true },
        isPublic: true,
        trustScore: 100,
        points: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ User profile created in Firebase:', {
        userId: firebaseUser.uid,
        userData: newUser
      });

      // Create a properly typed user for local state
      const userWithId: User = {
        ...newUser,
        id: firebaseUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set({
        user: userWithId,
        firebaseUser,
        isAuthenticated: true,
        loading: false
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create demo user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Demo user already exists. Please sign in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }
})); 