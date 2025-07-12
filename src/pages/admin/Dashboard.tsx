import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Ban,
  UserCheck,
  Send
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    users, 
    reports, 
    loading, 
    fetchAllUsers, 
    fetchReports, 
    banUser, 
    unbanUser, 
    resolveReport,
    rejectSkillDescription,
    approveSkillDescription,
    sendPlatformMessage,
    exportUserData,
    exportSwapData
  } = useAdminStore();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0,
    reports: 0
  });
  
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showReportManagement, setShowReportManagement] = useState(false);
  const [showPlatformMessage, setShowPlatformMessage] = useState(false);
  const [showSkillModeration, setShowSkillModeration] = useState(false);
  const [platformMessage, setPlatformMessage] = useState({ title: '', message: '' });

  const [recentActivity] = useState([
    { type: 'user_joined', description: 'New user registered: John Doe', timestamp: new Date() },
    { type: 'swap_completed', description: 'Skill swap completed: JavaScript ↔ Python', timestamp: new Date(Date.now() - 3600000) },
    { type: 'report_submitted', description: 'Report submitted for user: Jane Smith', timestamp: new Date(Date.now() - 7200000) },
    { type: 'user_banned', description: 'User banned for inappropriate behavior', timestamp: new Date(Date.now() - 10800000) }
  ]);

  const [topSkills] = useState([
    { skill: 'JavaScript', count: 45 },
    { skill: 'Python', count: 38 },
    { skill: 'Cooking', count: 32 },
    { skill: 'Guitar', count: 28 },
    { skill: 'Spanish', count: 25 }
  ]);

  useEffect(() => {
    if (user) {
      fetchAllUsers();
      fetchReports();
    }
  }, [user, fetchAllUsers, fetchReports]);

  useEffect(() => {
    // Update stats based on fetched data
    setStats({
      totalUsers: users.length,
      activeUsers: users.filter(u => !u.isBanned).length,
      totalSwaps: 0, // This would need to be fetched from swap store
      completedSwaps: 0,
      pendingSwaps: 0,
      reports: reports.filter(r => r.status === 'pending').length
    });
  }, [users, reports]);

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId, 'Violation of community guidelines');
      toast.success('User banned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      toast.success('User unbanned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      await resolveReport(reportId, action, user?.id || '');
      toast.success(`Report ${action} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve report');
    }
  };

  const handleSendPlatformMessage = async () => {
    if (!platformMessage.title.trim() || !platformMessage.message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    try {
      await sendPlatformMessage(platformMessage.title, platformMessage.message);
      toast.success('Platform message sent successfully');
      setPlatformMessage({ title: '', message: '' });
      setShowPlatformMessage(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send platform message');
    }
  };

  const handleExportData = async (type: 'users' | 'swaps') => {
    try {
      let csvContent = '';
      if (type === 'users') {
        csvContent = await exportUserData();
      } else {
        csvContent = await exportSwapData();
      }
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} data exported successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the Skill Swap platform</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => handleExportData('users')}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button onClick={() => handleExportData('swaps')}>
            <Download className="w-4 h-4 mr-2" />
            Export Swaps
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Swaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reports}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'user_joined' && <Users className="w-4 h-4 text-primary-600" />}
                  {activity.type === 'swap_completed' && <CheckCircle className="w-4 h-4 text-success-600" />}
                  {activity.type === 'report_submitted' && <AlertTriangle className="w-4 h-4 text-warning-600" />}
                  {activity.type === 'user_banned' && <XCircle className="w-4 h-4 text-error-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Skills</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                </div>
                <span className="text-sm text-gray-600">{skill.count} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => setShowUserManagement(!showUserManagement)}
          >
            <Shield className="w-5 h-5 mr-2" />
            Moderate Users
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => setShowReportManagement(!showReportManagement)}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Review Reports
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => setShowSkillModeration(!showSkillModeration)}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Moderate Skills
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => setShowPlatformMessage(!showPlatformMessage)}
          >
            <Send className="w-5 h-5 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Swap Statistics */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Swap Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-success-600">{stats.completedSwaps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-semibold text-warning-600">{stats.pendingSwaps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-semibold text-primary-600">{stats.totalSwaps - stats.completedSwaps - stats.pendingSwaps}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-semibold text-primary-600">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive Users</span>
              <span className="text-sm font-semibold text-gray-600">{stats.totalUsers - stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Activity Rate</span>
              <span className="text-sm font-semibold text-success-600">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-success-600">
                {Math.round((stats.completedSwaps / stats.totalSwaps) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Rate</span>
              <span className="text-sm font-semibold text-warning-600">
                {Math.round((stats.pendingSwaps / stats.totalSwaps) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Report Rate</span>
              <span className="text-sm font-semibold text-error-600">
                {Math.round((stats.reports / stats.totalUsers) * 1000)} per 1000 users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      {showUserManagement && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.photoURL ? (
                            <img className="h-10 w-10 rounded-full" src={user.photoURL} alt={user.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-semibold">{user.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.trustScore}/100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.isBanned ? (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleUnbanUser(user.id)}
                          loading={loading}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() => handleBanUser(user.id)}
                          loading={loading}
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Ban
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Management Section */}
      {showReportManagement && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Management</h2>
          <div className="space-y-4">
            {reports.filter(r => r.status === 'pending').slice(0, 10).map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">Report #{report.id.slice(-6)}</span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Description:</strong> {report.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reported on {report.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleResolveReport(report.id, 'resolved')}
                      loading={loading}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'dismissed')}
                      loading={loading}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {reports.filter(r => r.status === 'pending').length === 0 && (
              <p className="text-gray-500 text-center py-8">No pending reports</p>
            )}
          </div>
        </div>
      )}

      {/* Platform Message Section */}
      {showPlatformMessage && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Send Platform Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Title</label>
              <input
                type="text"
                value={platformMessage.title}
                onChange={(e) => setPlatformMessage({ ...platformMessage, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter message title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                value={platformMessage.message}
                onChange={(e) => setPlatformMessage({ ...platformMessage, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter message content..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPlatformMessage(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendPlatformMessage}
                loading={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Moderation Section */}
      {showSkillModeration && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Skill Description Moderation</h2>
          <div className="space-y-4">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      <span className="text-sm text-gray-500">({user.email})</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Skills Offered:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.skillsOffered?.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                              <span className="text-xs text-gray-700">{skill.name}</span>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => approveSkillDescription(user.id, skill.id)}
                                  loading={loading}
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="error"
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) {
                                      rejectSkillDescription(user.id, skill.id, reason);
                                    }
                                  }}
                                  loading={loading}
                                >
                                  ✗
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Skills Wanted:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.skillsWanted?.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                              <span className="text-xs text-gray-700">{skill.name}</span>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => approveSkillDescription(user.id, skill.id)}
                                  loading={loading}
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="error"
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) {
                                      rejectSkillDescription(user.id, skill.id, reason);
                                    }
                                  }}
                                  loading={loading}
                                >
                                  ✗
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-8">No users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 