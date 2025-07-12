import { create } from 'zustand';
import { SwapRequest, User, Skill } from '../types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

interface SwapState {
  swapRequests: SwapRequest[];
  loading: boolean;
  error: string | null;
}

interface SwapActions {
  createSwapRequest: (toUserId: string, toUser: User, skillsExchanged: { offered: Skill[]; wanted: Skill[] }, message?: string) => Promise<void>;
  acceptSwapRequest: (requestId: string, responseMessage?: string) => Promise<void>;
  rejectSwapRequest: (requestId: string, responseMessage?: string) => Promise<void>;
  completeSwapRequest: (requestId: string, notes?: string) => Promise<void>;
  cancelSwapRequest: (requestId: string) => Promise<void>;
  deleteSwapRequest: (requestId: string) => Promise<void>;
  fetchSwapRequests: (userId: string) => void;
  refreshSwapRequests: (userId: string) => Promise<void>;
  testFirebaseConnection: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type SwapStore = SwapState & SwapActions;

export const useSwapStore = create<SwapStore>((set, get) => ({
  swapRequests: [],
  loading: false,
  error: null,

  createSwapRequest: async (toUserId: string, toUser: User, skillsExchanged: { offered: Skill[]; wanted: Skill[] }, message?: string) => {
    try {
      set({ loading: true, error: null });
      
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      const swapData = {
        fromUserId: user.id,
        toUserId,
        fromUser: user,
        toUser,
        skillsExchanged,
        status: 'pending' as const,
        message,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'swapRequests'), {
        ...swapData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Swap request created in Firebase:', {
        requestData: swapData
      });

      // Create notification for recipient
      const { createNotification } = useNotificationStore.getState();
      await createNotification({
        userId: toUserId,
        type: 'swap_request',
        title: 'New Swap Request',
        message: `${user.name} wants to swap skills with you!`,
        isRead: false,
        relatedId: docRef.id
      });

      // Create a properly typed swap request for local state
      const newSwapRequest: SwapRequest = {
        ...swapData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        swapRequests: [...state.swapRequests, newSwapRequest]
      }));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  acceptSwapRequest: async (requestId: string, responseMessage?: string) => {
    try {
      set({ loading: true, error: null });
      
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      console.log('🔄 Accepting swap request:', requestId);
      console.log('👤 Current user:', user.id);

      // First, let's verify the request exists in our state
      const currentRequest = get().swapRequests.find(r => r.id === requestId);
      console.log('📋 Current request in state:', currentRequest);

      const requestRef = doc(db, 'swapRequests', requestId);
      console.log('📄 Firebase document reference:', requestRef.path);
      
      // Test Firebase connection
      console.log('🔄 Testing Firebase update...');
      await updateDoc(requestRef, {
        status: 'accepted',
        responseMessage,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Firebase updated successfully');

      // Create notification for requester
      if (currentRequest) {
        const { createNotification } = useNotificationStore.getState();
        await createNotification({
          userId: currentRequest.fromUserId,
          type: 'swap_accepted',
          title: 'Swap Request Accepted',
          message: `${user.name} accepted your swap request!`,
          isRead: false,
          relatedId: requestId
        });
        console.log('✅ Notification created');
      }

      // Manually update local state for immediate UI feedback
      console.log('🔄 Updating local state...');
      set(state => {
        const updatedRequests = state.swapRequests.map(req =>
          req.id === requestId
            ? { ...req, status: 'accepted' as const, responseMessage, updatedAt: new Date() }
            : req
        );
        console.log('📊 Updated requests:', updatedRequests.map(r => ({ id: r.id, status: r.status })));
        return { swapRequests: updatedRequests };
      });
      
      console.log('✅ Local state updated successfully');
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ Error accepting swap request:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      set({ error: error.message, loading: false });
    }
  },

  rejectSwapRequest: async (requestId: string, responseMessage?: string) => {
    try {
      set({ loading: true, error: null });
      
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      console.log('🔄 Rejecting swap request:', requestId);

      const requestRef = doc(db, 'swapRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        responseMessage,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Firebase updated successfully');

      // Create notification for requester
      const request = get().swapRequests.find(r => r.id === requestId);
      if (request) {
        const { createNotification } = useNotificationStore.getState();
        await createNotification({
          userId: request.fromUserId,
          type: 'swap_rejected',
          title: 'Swap Request Rejected',
          message: `${user.name} declined your swap request.`,
          isRead: false,
          relatedId: requestId
        });
      }

      // Manually update local state for immediate UI feedback
      set(state => ({
        swapRequests: state.swapRequests.map(req =>
          req.id === requestId
            ? { ...req, status: 'rejected' as const, responseMessage, updatedAt: new Date() }
            : req
        )
      }));
      
      console.log('✅ Local state updated, waiting for real-time sync...');
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ Error rejecting swap request:', error);
      set({ error: error.message, loading: false });
    }
  },

  completeSwapRequest: async (requestId: string, notes?: string) => {
    try {
      set({ loading: true, error: null });
      
      const requestRef = doc(db, 'swapRequests', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        notes,
        updatedAt: serverTimestamp()
      });

      set(state => ({
        swapRequests: state.swapRequests.map(req =>
          req.id === requestId
            ? { ...req, status: 'completed' as const, completedAt: new Date(), notes, updatedAt: new Date() }
            : req
        )
      }));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  cancelSwapRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      
      const requestRef = doc(db, 'swapRequests', requestId);
      await updateDoc(requestRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      set(state => ({
        swapRequests: state.swapRequests.map(req =>
          req.id === requestId
            ? { ...req, status: 'cancelled' as const, updatedAt: new Date() }
            : req
        )
      }));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSwapRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      
      const requestRef = doc(db, 'swapRequests', requestId);
      await updateDoc(requestRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });

      set(state => ({
        swapRequests: state.swapRequests.filter(req => req.id !== requestId)
      }));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSwapRequests: (userId: string) => {
    set({ loading: true });
    
    console.log('🔄 Fetching swap requests for user:', userId);
    
    // Use a compound query to fetch requests where user is either sender or receiver
    const q = query(
      collection(db, 'swapRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📡 Real-time update received, documents count:', snapshot.docs.length);
      
      const allRequests: SwapRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document data:', { 
          id: doc.id, 
          status: data.status, 
          fromUserId: data.fromUserId, 
          toUserId: data.toUserId,
          updatedAt: data.updatedAt?.toDate?.() || 'no date'
        });
        
        const request: SwapRequest = {
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          fromUser: data.fromUser,
          toUser: data.toUser,
          skillsExchanged: data.skillsExchanged,
          status: data.status || 'pending', // Ensure status is always defined
          message: data.message,
          responseMessage: data.responseMessage,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        };
        
        // Only include requests where the current user is involved
        if (request.fromUserId === userId || request.toUserId === userId) {
          allRequests.push(request);
          console.log('✅ Including request:', { 
            id: request.id, 
            status: request.status,
            fromUserId: request.fromUserId,
            toUserId: request.toUserId,
            isCurrentUserSender: request.fromUserId === userId,
            isCurrentUserReceiver: request.toUserId === userId
          });
        } else {
          console.log('❌ Excluding request (user not involved):', { 
            id: request.id, 
            fromUserId: request.fromUserId, 
            toUserId: request.toUserId, 
            currentUserId: userId 
          });
        }
      });

      console.log('📊 Final filtered requests:', allRequests.map(r => ({ 
        id: r.id, 
        status: r.status,
        fromUserId: r.fromUserId,
        toUserId: r.toUserId
      })));
      
      // Force a state update to ensure React re-renders
      set({ swapRequests: [...allRequests], loading: false });
    }, (error) => {
      console.error('❌ Error fetching swap requests:', error);
      set({ error: error.message, loading: false });
    });

    return unsubscribe;
  },

  refreshSwapRequests: async (userId: string) => {
    try {
      console.log('🔄 Manual refresh triggered for user:', userId);
      set({ loading: true });
      
      // Force a fresh fetch by calling fetchSwapRequests again
      // This will trigger the onSnapshot listener to refresh
      const { fetchSwapRequests } = get();
      fetchSwapRequests(userId);
      
      // Wait a bit for the listener to update
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ Error refreshing swap requests:', error);
      set({ error: error.message, loading: false });
    }
  },

  testFirebaseConnection: async () => {
    try {
      console.log('🔄 Testing Firebase connection...');
      
      // Test writing to a test collection
      const testDoc = await addDoc(collection(db, 'test'), { 
        message: 'Test message', 
        timestamp: serverTimestamp() 
      });
      console.log('✅ Test document created:', testDoc.id);
      
      // Test reading from the test collection
      console.log('✅ Firebase connection test successful');
      
      // Clean up test document
      // await deleteDoc(doc(db, 'test', testDoc.id));
      
    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
      throw error;
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  }
})); 