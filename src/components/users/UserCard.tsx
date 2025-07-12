import React, { useState } from 'react';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useSwapStore } from '../../store/swapStore';
import { 
  MapPin, 
  Star, 
  Clock, 
  MessageSquare, 
  Award,
  Zap,
  MoreVertical,
  Flag
} from 'lucide-react';
import Button from '../common/Button';
import SwapRequestModal from '../modals/SwapRequestModal';
import ReportModal from '../modals/ReportModal';
import toast from 'react-hot-toast';

interface UserCardProps {
  user: User;
  isAIMatch?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, isAIMatch = false }) => {
  const { user: currentUser } = useAuthStore();
  const { createSwapRequest, loading } = useSwapStore();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSwapRequest = async (skillsExchanged: { offered: any[]; wanted: any[] }, message?: string) => {
    try {
      await createSwapRequest(user.id, user, skillsExchanged, message);
      setShowSwapModal(false);
      toast.success('Swap request sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send swap request');
    }
  };

  const getAvailabilityText = (availability: User['availability']) => {
    const times = [];
    if (availability.weekends) times.push('Weekends');
    if (availability.evenings) times.push('Evenings');
    if (availability.custom) times.push(availability.custom);
    
    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${isAIMatch ? 'ring-2 ring-warning-200' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              {user.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAIMatch && (
              <div className="flex items-center text-warning-600">
                <Zap className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">AI Match</span>
              </div>
            )}
            
            {currentUser && currentUser.id !== user.id && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report User
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Score and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <Star className="w-4 h-4 text-warning-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {user.trustScore}/100
              </span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-primary-500 mr-1" />
              <span className="text-sm text-gray-600">{user.points} points</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {getAvailabilityText(user.availability)}
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Offered</h4>
          <div className="flex flex-wrap gap-2">
            {(user.skillsOffered || []).slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${getSkillLevelColor(skill.level)}`}
              >
                {skill.name}
              </span>
            ))}
            {(user.skillsOffered || []).length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{(user.skillsOffered || []).length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Wanted</h4>
          <div className="flex flex-wrap gap-2">
            {(user.skillsWanted || []).slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {skill.name}
              </span>
            ))}
            {(user.skillsWanted || []).length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{(user.skillsWanted || []).length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        {(user.badges || []).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Badges</h4>
            <div className="flex flex-wrap gap-2">
              {(user.badges || []).slice(0, 3).map((badge) => (
                <span
                  key={badge.id}
                  className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                  title={badge.description}
                >
                  {badge.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {currentUser && currentUser.id !== user.id && (
          <Button
            onClick={() => setShowSwapModal(true)}
            className="w-full"
            loading={loading}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Request Swap
          </Button>
        )}
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <SwapRequestModal
          user={user}
          onClose={() => setShowSwapModal(false)}
          onSubmit={handleSwapRequest}
          loading={loading}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          reportedUser={user}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default UserCard; 