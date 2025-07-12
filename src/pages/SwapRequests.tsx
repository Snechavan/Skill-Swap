import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSwapStore } from '../store/swapStore';

import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Filter,
  Calendar,
  User,
  Star,
  ThumbsUp
} from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FeedbackModal from '../components/modals/FeedbackModal';
import CompletionModal from '../components/modals/CompletionModal';
import toast from 'react-hot-toast';

const SwapRequests: React.FC = () => {
  const { user } = useAuthStore();
  const { swapRequests, loading, acceptSwapRequest, rejectSwapRequest, completeSwapRequest, cancelSwapRequest, deleteSwapRequest, fetchSwapRequests, refreshSwapRequests, testFirebaseConnection } = useSwapStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);

  useEffect(() => {
    if (user) {
      console.log('🔄 Fetching swap requests for user:', user.id);
      fetchSwapRequests(user.id);
    }
  }, [user, fetchSwapRequests]);

  console.log('📊 Current swap requests:', swapRequests);
  console.log('👤 Current user:', user);
  console.log('🔍 Current filter:', filter);

  const filteredRequests = swapRequests.filter(request => {
    if (filter === 'all') return true;
    const matches = request.status === filter;
    console.log(`🔍 Request ${request.id}: status=${request.status}, filter=${filter}, matches=${matches}`);
    return matches;
  });

  console.log('📋 Filtered requests:', filteredRequests.map(r => ({ id: r.id, status: r.status })));

  const handleAction = async (action: string, swapId: string) => {
    console.log('🔄 Handling action:', action, 'for swap:', swapId);
    try {
      switch (action) {
        case 'accept':
          console.log('✅ Accepting swap request:', swapId);
          await acceptSwapRequest(swapId);
          toast.success('Swap request accepted!');
          // Force refresh to ensure UI updates
          if (user) {
            console.log('🔄 Refreshing swap requests after accept...');
            await refreshSwapRequests(user.id);
          }
          break;
        case 'reject':
          console.log('❌ Rejecting swap request:', swapId);
          await rejectSwapRequest(swapId);
          toast.success('Swap request rejected');
          // Force refresh to ensure UI updates
          if (user) {
            console.log('🔄 Refreshing swap requests after reject...');
            await refreshSwapRequests(user.id);
          }
          break;
        case 'complete':
          console.log('✅ Completing swap request:', swapId);
          await completeSwapRequest(swapId);
          toast.success('Swap marked as completed!');
          break;
        case 'cancel':
          console.log('❌ Cancelling swap request:', swapId);
          await cancelSwapRequest(swapId);
          toast.success('Swap request cancelled');
          break;
        case 'delete':
          console.log('❌ Deleting swap request:', swapId);
          await deleteSwapRequest(swapId);
          toast.success('Swap request deleted');
          // Force refresh to ensure UI updates
          if (user) {
            console.log('🔄 Refreshing swap requests after delete...');
            await refreshSwapRequests(user.id);
          }
          break;
        default:
          console.log('❓ Unknown action:', action);
      }
    } catch (error: any) {
      console.error('❌ Error handling action:', error);
      toast.error(error.message || 'Failed to perform action');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Swaps</h1>
          <p className="text-gray-600">Manage your skill swap requests</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (user) {
                console.log('🔄 Manual refresh triggered');
                await refreshSwapRequests(user.id);
              }
            }}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Debug Panel - Always visible for troubleshooting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">🐛 Debug Panel</h4>
        <div className="text-xs text-yellow-800 space-y-1">
          <p>Total requests: {swapRequests.length}</p>
          <p>Current filter: {filter}</p>
          <p>Filtered count: {filteredRequests.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <div className="mt-2">
            <p className="font-medium">Request Statuses:</p>
            {swapRequests.map(req => (
              <p key={req.id} className="ml-2">
                • {req.id.slice(0, 8)}... → <span className="font-mono">{req.status}</span>
                {req.fromUserId === user?.id ? ' (sent)' : ' (received)'}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'pending', 'accepted', 'completed', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Debug Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">🔍 Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Total requests: {swapRequests.length}</p>
              <p>Current filter: {filter}</p>
              <p>Filtered count: {filteredRequests.length}</p>
              <div className="mt-2">
                <p className="font-medium">All requests status:</p>
                {swapRequests.map(req => (
                  <p key={req.id} className="ml-2">
                    • {req.id.slice(0, 8)}... → {req.status} 
                    {req.fromUserId === user?.id ? ' (sent)' : ' (received)'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Section - Only show when no requests exist */}
      {filteredRequests.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🧪 Testing Swap Requests</h3>
          <p className="text-blue-700 mb-4">
            You don't have any swap requests yet. To test the functionality:
          </p>
          <div className="space-y-2 text-sm text-blue-600">
            <p>1. <strong>Create another account</strong> or use the demo account</p>
            <p>2. <strong>Search for users</strong> and send swap requests</p>
            <p>3. <strong>Switch between accounts</strong> to accept/reject requests</p>
            <p>4. <strong>Check the browser console</strong> (F12) for debugging info</p>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => window.open('/search', '_blank')}
              variant="outline"
              size="sm"
            >
              🔍 Go to Search Page
            </Button>
            <Button
              onClick={async () => {
                try {
                  // Create a test swap request to yourself for testing
                  const { createSwapRequest } = useSwapStore.getState();
                  if (user) {
                    await createSwapRequest(
                      user.id, // Send to yourself for testing
                      user,
                      {
                        offered: [{ id: 'test-1', name: 'JavaScript', category: 'Programming', level: 'intermediate' }],
                        wanted: [{ id: 'test-2', name: 'Python', category: 'Programming', level: 'beginner' }]
                      },
                      'This is a test swap request for testing purposes'
                    );
                    toast.success('Test swap request created!');
                  }
                } catch (error: any) {
                  toast.error('Failed to create test request: ' + error.message);
                }
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              🧪 Create Test Request
            </Button>
            <Button
              onClick={async () => {
                try {
                  // Test updating the first pending request to accepted
                  const pendingRequest = swapRequests.find(r => r.status === 'pending');
                  if (pendingRequest) {
                    console.log('🧪 Testing manual status update for:', pendingRequest.id);
                    const { acceptSwapRequest } = useSwapStore.getState();
                    await acceptSwapRequest(pendingRequest.id);
                    toast.success('Test status update completed!');
                  } else {
                    toast.error('No pending requests found to test');
                  }
                } catch (error: any) {
                  toast.error('Test failed: ' + error.message);
                }
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              🧪 Test Accept
            </Button>
            <Button
              onClick={() => {
                // Simple test to verify filtering
                console.log('🧪 Testing filter logic...');
                const testRequests = [
                  { id: '1', status: 'pending' },
                  { id: '2', status: 'accepted' },
                  { id: '3', status: 'rejected' }
                ];
                
                const pendingFilter = testRequests.filter(r => r.status === 'pending');
                const acceptedFilter = testRequests.filter(r => r.status === 'accepted');
                
                console.log('🧪 Filter test results:', {
                  pending: pendingFilter.length,
                  accepted: acceptedFilter.length,
                  all: testRequests.length
                });
                
                toast.success('Filter test completed - check console');
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              🧪 Test Filter
            </Button>
            <Button
              onClick={async () => {
                try {
                  console.log('🧪 Testing Firebase connection...');
                  await testFirebaseConnection();
                  toast.success('Firebase connection test successful!');
                } catch (error: any) {
                  console.error('❌ Firebase test failed:', error);
                  toast.error('Firebase test failed: ' + error.message);
                }
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              🔥 Test Firebase
            </Button>
          </div>
        </div>
      )}

      {/* Swap Requests */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any swap requests yet. Start by searching for skills to swap!"
                : `No ${filter} swap requests found.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Swap with {request.toUser.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  {/* Skills Exchange */}
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">You'll teach:</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.skillsExchanged.offered.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">You'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.skillsExchanged.wanted.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">{request.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {request.toUser.name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(request.updatedAt)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAction('accept', request.id)}
                            loading={loading}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="error"
                            onClick={() => handleAction('reject', request.id)}
                            loading={loading}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'accepted' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedSwap(request);
                            setShowCompletionModal(true);
                          }}
                          loading={loading}
                        >
                          Mark Complete
                        </Button>
                      )}
                      
                      {['pending', 'accepted'].includes(request.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('cancel', request.id)}
                          loading={loading}
                        >
                          Cancel
                        </Button>
                      )}
                      
                      {request.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedSwap(request);
                            setShowFeedbackModal(true);
                          }}
                          loading={loading}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Rate
                        </Button>
                      )}
                      
                      {['rejected', 'cancelled', 'completed'].includes(request.status) && (
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() => handleAction('delete', request.id)}
                          loading={loading}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{swapRequests.length}</div>
          <div className="text-sm text-gray-600">Total Swaps</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {swapRequests.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {swapRequests.filter(r => r.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {swapRequests.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSwap && (
        <FeedbackModal
          swapRequestId={selectedSwap.id}
          fromUser={selectedSwap.fromUser}
          toUser={selectedSwap.toUser}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedSwap(null);
          }}
          onSubmit={() => {
            // Refresh the swaps list after feedback submission
            if (user) {
              fetchSwapRequests(user.id);
            }
          }}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && selectedSwap && (
        <CompletionModal
          swapRequestId={selectedSwap.id}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedSwap(null);
          }}
          onSubmit={async (notes) => {
            try {
              await completeSwapRequest(selectedSwap.id, notes);
              toast.success('Swap marked as completed!');
              // Refresh the swaps list after completion
              if (user) {
                fetchSwapRequests(user.id);
              }
            } catch (error: any) {
              toast.error(error.message || 'Failed to complete swap');
            }
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SwapRequests; 