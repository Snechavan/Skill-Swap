import { create } from 'zustand';
import { User, Report } from '../types';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  updateDoc,
  query,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

interface AdminState {
  users: User[];
  reports: Report[];
  loading: boolean;
  error: string | null;
}

interface AdminActions {
  // User Management
  fetchAllUsers: () => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  
  // Report Management
  fetchReports: () => Promise<void>;
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed', adminId: string) => Promise<void>;
  createReport: (
    reporterId: string,
    reason: string,
    description: string,
    reportedUserId?: string,
    reportedSwapId?: string
  ) => Promise<void>;
  
  // Skill Description Moderation
  rejectSkillDescription: (userId: string, skillId: string, reason: string) => Promise<void>;
  approveSkillDescription: (userId: string, skillId: string) => Promise<void>;
  
  // Platform Management
  sendPlatformMessage: (title: string, message: string, targetUsers?: string[]) => Promise<void>;
  exportUserData: () => Promise<string>;
  exportSwapData: () => Promise<string>;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type AdminStore = AdminState & AdminActions;

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: [],
  reports: [],
  loading: false,
  error: null,

  // User Management
  fetchAllUsers: async () => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const userData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as User);
      });
      
      set({ users: userData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  banUser: async (userId: string, reason: string) => {
    try {
      set({ loading: true, error: null });
      
      const batch = writeBatch(db);
      
      // Update user status to banned
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        isBanned: true,
        banReason: reason,
        bannedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create notification for the user
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId,
        type: 'system',
        title: 'Account Suspended',
        message: `Your account has been suspended for: ${reason}. Please contact support if you believe this is an error.`,
        isRead: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      // Refresh users list
      await get().fetchAllUsers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  unbanUser: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const batch = writeBatch(db);
      
      // Update user status to unbanned
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        updatedAt: serverTimestamp()
      });
      
      // Create notification for the user
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId,
        type: 'system',
        title: 'Account Restored',
        message: 'Your account has been restored. You can now use the platform normally.',
        isRead: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      // Refresh users list
      await get().fetchAllUsers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    try {
      set({ loading: true, error: null });
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp()
      });
      
      // Refresh users list
      await get().fetchAllUsers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Report Management
  fetchReports: async () => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const reportData: Report[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reportData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate()
        } as Report);
      });
      
      set({ reports: reportData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  resolveReport: async (reportId: string, action: 'resolved' | 'dismissed', adminId: string) => {
    try {
      set({ loading: true, error: null });
      
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: action,
        resolvedAt: serverTimestamp(),
        resolvedBy: adminId
      });
      
      // Refresh reports list
      await get().fetchReports();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createReport: async (
    reporterId: string,
    reason: string,
    description: string,
    reportedUserId?: string,
    reportedSwapId?: string
  ) => {
    try {
      set({ loading: true, error: null });
      const reportData = {
        reporterId,
        reportedUserId,
        reportedSwapId,
        reason,
        description,
        status: 'pending' as const,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reports'), reportData);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Skill Description Moderation
  rejectSkillDescription: async (userId: string, skillId: string, reason: string) => {
    try {
      set({ loading: true, error: null });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`skillDescriptions.${skillId}.status`]: 'rejected',
        [`skillDescriptions.${skillId}.rejectionReason`]: reason,
        updatedAt: serverTimestamp()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  approveSkillDescription: async (userId: string, skillId: string) => {
    try {
      set({ loading: true, error: null });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`skillDescriptions.${skillId}.status`]: 'approved',
        updatedAt: serverTimestamp()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Platform Management
  sendPlatformMessage: async (title: string, message: string, targetUsers?: string[]) => {
    try {
      set({ loading: true, error: null });
      
      const batch = writeBatch(db);
      
      if (targetUsers && targetUsers.length > 0) {
        // Send to specific users
        targetUsers.forEach(userId => {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            userId,
            type: 'system',
            title,
            message,
            isRead: false,
            createdAt: serverTimestamp()
          });
        });
      } else {
        // Send to all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.forEach(userDoc => {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            userId: userDoc.id,
            type: 'system',
            title,
            message,
            isRead: false,
            createdAt: serverTimestamp()
          });
        });
      }
      
      await batch.commit();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  exportUserData: async () => {
    try {
      set({ loading: true, error: null });
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userData: any[] = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        userData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          location: data.location,
          role: data.role,
          isPublic: data.isPublic,
          isBanned: data.isBanned || false,
          trustScore: data.trustScore,
          points: data.points,
          skillsOffered: data.skillsOffered?.length || 0,
          skillsWanted: data.skillsWanted?.length || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      const csvContent = convertToCSV(userData);
      set({ loading: false });
      return csvContent;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return '';
    }
  },

  exportSwapData: async () => {
    try {
      set({ loading: true, error: null });
      
      const swapsSnapshot = await getDocs(collection(db, 'swap_requests'));
      const swapData: any[] = [];
      
      swapsSnapshot.forEach(doc => {
        const data = doc.data();
        swapData.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status,
          skillsOffered: data.skillsExchanged?.offered?.length || 0,
          skillsWanted: data.skillsExchanged?.wanted?.length || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || null
        });
      });
      
      const csvContent = convertToCSV(swapData);
      set({ loading: false });
      return csvContent;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return '';
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));

// Utility function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
} 