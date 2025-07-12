export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  location?: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  availability: Availability;
  isPublic: boolean;
  trustScore: number;
  points: number;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Availability {
  weekends: boolean;
  evenings: boolean;
  custom?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  skillsExchanged: {
    offered: Skill[];
    wanted: Skill[];
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  responseMessage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  swapRequestId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'feedback_received' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // ID of related swap request, feedback, etc.
  createdAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  completedSwaps: number;
  pendingSwaps: number;
  topSkills: { skill: string; count: number }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: Date;
  }[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedSwapId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AIMatch {
  userId: string;
  user: User;
  matchScore: number;
  reasoning: string;
  suggestedSkills: {
    offered: Skill[];
    wanted: Skill[];
  };
} 