import React, { useState } from 'react';
import { User } from '../../types';
import { useFeedbackStore } from '../../store/feedbackStore';
import { Star, X, Send } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  swapRequestId: string;
  fromUser: User;
  toUser: User;
  onClose: () => void;
  onSubmit?: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  swapRequestId,
  fromUser,
  toUser,
  onClose,
  onSubmit
}) => {
  const { submitFeedback, loading } = useFeedbackStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await submitFeedback(
        fromUser.id,
        toUser.id,
        swapRequestId,
        rating,
        comment
      );
      
      toast.success('Feedback submitted successfully!');
      onSubmit?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        className="text-2xl transition-colors duration-200 focus:outline-none"
      >
        <Star
          className={`w-8 h-8 ${
            star <= (hoverRating || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  const getRatingText = () => {
    if (rating === 0) return 'Select a rating';
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rate Your Experience</h2>
              <p className="text-sm text-gray-600">with {toUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              How was your skill swap experience?
            </h3>
            
            <div className="flex justify-center space-x-2 mb-4">
              {renderStars()}
            </div>
            
            <p className="text-lg font-semibold text-gray-900">
              {getRatingText()}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience, what went well, or suggestions for improvement..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warning-500 focus:border-transparent"
            />
          </div>

          {/* Swap Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Swap Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Partner:</strong> {toUser.name}</p>
              <p><strong>Skills Offered:</strong> {toUser.skillsOffered?.length || 0}</p>
              <p><strong>Skills Wanted:</strong> {toUser.skillsWanted?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            loading={loading}
            className="bg-warning-600 hover:bg-warning-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 