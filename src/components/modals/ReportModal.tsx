import React, { useState } from 'react';
import { User } from '../../types';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, X, Send } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface ReportModalProps {
  reportedUser?: User;
  reportedSwapId?: string;
  onClose: () => void;
  onSubmit?: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  reportedUser,
  reportedSwapId,
  onClose,
  onSubmit
}) => {
  const { user: currentUser } = useAuthStore();
  const { createReport, loading } = useAdminStore();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportReasons = [
    'Inappropriate behavior',
    'Spam or misleading content',
    'Harassment or bullying',
    'Fake profile or impersonation',
    'Inappropriate skill descriptions',
    'No-show or ghosting',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please select a reason');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to submit a report');
      return;
    }

    try {
      await createReport(
        currentUser.id,
        reason,
        description,
        reportedUser?.id,
        reportedSwapId
      );
      
      toast.success('Report submitted successfully. We will review it shortly.');
      onSubmit?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Report Issue</h2>
              <p className="text-sm text-gray-600">
                {reportedUser ? `Report ${reportedUser.name}` : 'Report content'}
              </p>
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
          {/* Reported User Info */}
          {reportedUser && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Reporting User</h4>
              <div className="flex items-center space-x-3">
                {reportedUser.photoURL ? (
                  <img 
                    src={reportedUser.photoURL} 
                    alt={reportedUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {reportedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{reportedUser.name}</p>
                  <p className="text-xs text-gray-600">{reportedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for Report *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label
                  key={reportReason}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-error-600 focus:ring-error-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{reportReason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details about the issue..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide as much detail as possible to help us understand the issue.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  False reports may result in account suspension. Please only report genuine violations of our community guidelines.
                </p>
              </div>
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
            disabled={!reason.trim() || !description.trim() || loading}
            loading={loading}
            variant="error"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal; 