import { create } from 'zustand';
import { Notification } from '../types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchNotifications: (userId: string) => (() => void) | undefined;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  clearNotifications: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: (userId: string) => {
    set({ loading: true });
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      let unreadCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          isRead: data.isRead || false,
          relatedId: data.relatedId,
          createdAt: data.createdAt?.toDate() || new Date()
        };
        
        notifications.push(notification);
        if (!notification.isRead) unreadCount++;
      });

      set({ 
        notifications, 
        unreadCount, 
        loading: false 
      });
    }, (error) => {
      set({ error: error.message, loading: false });
    });

    return unsubscribe;
  },

  markAsRead: async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const { notifications } = get();
      const unreadNotifications = notifications.filter(n => !n.isRead && n.userId === userId);
      
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  }
})); 