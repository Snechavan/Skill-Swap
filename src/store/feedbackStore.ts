import { create } from 'zustand';
import { Feedback, User } from '../types';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

interface FeedbackState {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
}

interface FeedbackActions {
  // Feedback Management
  submitFeedback: (
    fromUserId: string,
    toUserId: string,
    swapRequestId: string,
    rating: number,
    comment: string
  ) => Promise<void>;
  
  fetchUserFeedbacks: (userId: string) => Promise<void>;
  fetchSwapFeedbacks: (swapRequestId: string) => Promise<void>;
  
  // Trust Score & Points
  updateUserTrustScore: (userId: string, rating: number) => Promise<void>;
  awardPoints: (userId: string, points: number, reason: string) => Promise<void>;
  checkAndAwardBadges: (userId: string) => Promise<void>;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type FeedbackStore = FeedbackState & FeedbackActions;

export const useFeedbackStore = create<FeedbackStore>((set, get) => ({
  feedbacks: [],
  loading: false,
  error: null,

  submitFeedback: async (
    fromUserId: string,
    toUserId: string,
    swapRequestId: string,
    rating: number,
    comment: string
  ) => {
    try {
      set({ loading: true, error: null });
      
      const batch = writeBatch(db);
      
      // Get user data for feedback
      const fromUserDoc = await getDocs(query(collection(db, 'users'), where('id', '==', fromUserId)));
      const toUserDoc = await getDocs(query(collection(db, 'users'), where('id', '==', toUserId)));
      
      const fromUser = fromUserDoc.docs[0]?.data() as User;
      const toUser = toUserDoc.docs[0]?.data() as User;
      
      if (!fromUser || !toUser) {
        throw new Error('User data not found');
      }
      
      // Create feedback
      const feedbackRef = doc(collection(db, 'feedbacks'));
      const feedbackData = {
        fromUserId,
        toUserId,
        fromUser,
        toUser,
        swapRequestId,
        rating,
        comment,
        createdAt: serverTimestamp()
      };
      
      batch.set(feedbackRef, feedbackData);
      
      // Update trust score for the user being rated
      const newTrustScore = calculateNewTrustScore(toUser.trustScore, rating);
      const toUserRef = doc(db, 'users', toUserId);
      batch.update(toUserRef, {
        trustScore: newTrustScore,
        updatedAt: serverTimestamp()
      });
      
      // Award points to the user being rated
      const pointsToAward = calculatePointsFromRating(rating);
      const currentPoints = toUser.points || 0;
      batch.update(toUserRef, {
        points: currentPoints + pointsToAward
      });
      
      // Create notification for the user being rated
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId: toUserId,
        type: 'feedback_received',
        title: 'New Feedback Received',
        message: `You received ${rating}/5 stars from ${fromUser.name} for your skill swap!`,
        isRead: false,
        relatedId: feedbackRef.id,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      // Check and award badges
      await get().checkAndAwardBadges(toUserId);
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUserFeedbacks: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'feedbacks'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const feedbackData: Feedback[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feedbackData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Feedback);
      });
      
      set({ feedbacks: feedbackData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSwapFeedbacks: async (swapRequestId: string) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'feedbacks'),
        where('swapRequestId', '==', swapRequestId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const feedbackData: Feedback[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feedbackData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Feedback);
      });
      
      set({ feedbacks: feedbackData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateUserTrustScore: async (userId: string, rating: number) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
      const userData = userDoc.docs[0]?.data() as User;
      
      if (!userData) return;
      
      const newTrustScore = calculateNewTrustScore(userData.trustScore, rating);
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        trustScore: newTrustScore,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating trust score:', error);
    }
  },

  awardPoints: async (userId: string, points: number, reason: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
      const userData = userDoc.docs[0]?.data() as User;
      
      if (!userData) return;
      
      const batch = writeBatch(db);
      
      // Update points
      const userRef = doc(db, 'users', userId);
      const currentPoints = userData.points || 0;
      batch.update(userRef, {
        points: currentPoints + points,
        updatedAt: serverTimestamp()
      });
      
      // Create notification
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId,
        type: 'system',
        title: 'Points Awarded',
        message: `You earned ${points} points for: ${reason}`,
        isRead: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error: any) {
      console.error('Error awarding points:', error);
    }
  },

  checkAndAwardBadges: async (userId: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
      const userData = userDoc.docs[0]?.data() as User;
      
      if (!userData) return;
      
      const batch = writeBatch(db);
      const newBadges: any[] = [];
      
      // Check for various badge conditions
      const existingBadgeNames = userData.badges?.map(b => b.name) || [];
      
      // First Swap Badge
      if (userData.points >= 10 && !existingBadgeNames.includes('First Swap')) {
        newBadges.push({
          id: `badge_${Date.now()}_1`,
          name: 'First Swap',
          description: 'Completed your first skill swap',
          icon: '🎯',
          earnedAt: new Date()
        });
      }
      
      // Trusted User Badge
      if (userData.trustScore >= 90 && !existingBadgeNames.includes('Trusted User')) {
        newBadges.push({
          id: `badge_${Date.now()}_2`,
          name: 'Trusted User',
          description: 'Maintained a high trust score',
          icon: '⭐',
          earnedAt: new Date()
        });
      }
      
      // Skill Master Badge
      if ((userData.skillsOffered?.length || 0) >= 5 && !existingBadgeNames.includes('Skill Master')) {
        newBadges.push({
          id: `badge_${Date.now()}_3`,
          name: 'Skill Master',
          description: 'Offered 5 or more skills',
          icon: '🏆',
          earnedAt: new Date()
        });
      }
      
      // Community Helper Badge
      if (userData.points >= 100 && !existingBadgeNames.includes('Community Helper')) {
        newBadges.push({
          id: `badge_${Date.now()}_4`,
          name: 'Community Helper',
          description: 'Earned 100+ points helping others',
          icon: '🤝',
          earnedAt: new Date()
        });
      }
      
      if (newBadges.length > 0) {
        const userRef = doc(db, 'users', userId);
        const allBadges = [...(userData.badges || []), ...newBadges];
        
        batch.update(userRef, {
          badges: allBadges,
          updatedAt: serverTimestamp()
        });
        
        // Create notification for each new badge
        newBadges.forEach(badge => {
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            userId,
            type: 'system',
            title: 'New Badge Earned!',
            message: `Congratulations! You earned the "${badge.name}" badge: ${badge.description}`,
            isRead: false,
            createdAt: serverTimestamp()
          });
        });
        
        await batch.commit();
      }
    } catch (error: any) {
      console.error('Error checking badges:', error);
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));

// Utility functions
function calculateNewTrustScore(currentScore: number, newRating: number): number {
  // Simple weighted average: 70% current score, 30% new rating
  const weightedCurrent = currentScore * 0.7;
  const weightedNew = newRating * 20 * 0.3; // Convert 1-5 rating to 0-100 scale
  return Math.round(weightedCurrent + weightedNew);
}

function calculatePointsFromRating(rating: number): number {
  // Award points based on rating
  switch (rating) {
    case 5: return 10;
    case 4: return 8;
    case 3: return 5;
    case 2: return 2;
    case 1: return 1;
    default: return 0;
  }
 }