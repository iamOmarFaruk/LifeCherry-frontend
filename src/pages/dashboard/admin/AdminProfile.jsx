// Admin Profile Page - LifeCherry Admin
import React, { useState, useEffect } from 'react';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePencilSquare,
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineCamera,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineFlag,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlineSparkles
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient from '../../../utils/apiClient';
import useAuth from '../../../hooks/useAuth';

const AdminProfile = () => {
  useDocumentTitle('Admin Profile');
  const { userProfile, authLoading, updateProfile } = useAuth();

  // State
  const [stats, setStats] = useState({
    usersManaged: 0,
    lessonsModerated: 0,
    reportsHandled: 0,
    lessonsFeatured: 0,
    actionsThisMonth: 0,
    actionsThisWeek: 0
  });
  const [recentActions, setRecentActions] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    photoURL: ''
  });

  useEffect(() => {
    if (userProfile) {
      setEditFormData({
        name: userProfile.displayName || userProfile.name || '',
        photoURL: userProfile.photoURL || ''
      });
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      setIsLoadingStats(true);
      const [usersRes, lessonsRes, reportsRes, auditRes] = await Promise.all([
        apiClient.get('/users?limit=1'), // Just for total count
        apiClient.get('/lessons/stats'),
        apiClient.get('/reports?status=resolved'),
        apiClient.get('/audit/admin?limit=100') // For recent actions and activity counts
      ]);

      const totalUsers = usersRes.data.total || 0;
      const lessonStats = lessonsRes.data || {};
      const resolvedReports = reportsRes.data.stats?.resolved || 0;
      const actions = auditRes.data.changes || [];

      // Filter actions for current admin
      const myActions = actions.filter(
        a => a.actorEmail === userProfile?.email?.toLowerCase()
      );

      // Calculate time-based stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const actionsThisWeek = myActions.filter(a => new Date(a.createdAt) >= oneWeekAgo).length;
      const actionsThisMonth = myActions.filter(a => new Date(a.createdAt) >= oneMonthAgo).length;

      setStats({
        usersManaged: totalUsers,
        lessonsModerated: lessonStats.total || 0,
        reportsHandled: resolvedReports,
        lessonsFeatured: lessonStats.featured || 0,
        actionsThisMonth,
        actionsThisWeek
      });

      setRecentActions(myActions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching admin profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!authLoading && userProfile) {
      fetchData();
    }
  }, [authLoading, userProfile]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.patch('/users/me', {
        name: editFormData.name,
        photoURL: editFormData.photoURL
      });

      // Update local context
      if (updateProfile) {
        await updateProfile({
          displayName: editFormData.name,
          photoURL: editFormData.photoURL
        });
      }

      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !userProfile) {
    return (
      <PageLoader>
        <div className="flex items-center justify-center h-64">
          <div className="text-cherry">Loading profile...</div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="space-y-6 max-w-5xl mx-auto">
        <DashboardPageHeader
          icon={HiOutlineShieldCheck}
          title="Admin Profile"
          description="Manage your account settings and view activity overview"
        />

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden">
          {/* Profile Info */}
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'Admin')}&background=random`}
                  alt={userProfile.name}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Name and Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-text dark:text-white">{userProfile.name || userProfile.displayName}</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 text-text-secondary dark:text-gray-400 text-sm">
                  <span className="flex items-center gap-1">
                    <HiOutlineEnvelope className="w-4 h-4" />
                    {userProfile.email}
                  </span>
                  <span className="hidden sm:block">•</span>
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="w-4 h-4" />
                    Member since {formatDate(userProfile.metadata?.creationTime || userProfile.createdAt)}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cherry text-white rounded-xl font-medium hover:bg-cherry-dark transition-colors"
              >
                <HiOutlinePencilSquare className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">
                  {isLoadingStats ? '...' : stats.usersManaged}
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cherry-50 dark:bg-cherry/20 rounded-xl flex items-center justify-center">
                <HiOutlineBookOpen className="w-6 h-6 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">
                  {isLoadingStats ? '...' : stats.lessonsModerated}
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Total Lessons</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">
                  {isLoadingStats ? '...' : stats.reportsHandled}
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Resolved Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineSparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">
                  {isLoadingStats ? '...' : stats.lessonsFeatured}
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Lessons Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text dark:text-white">Recent Actions</h3>
              <span className="text-sm text-text-secondary dark:text-gray-400">Your latest activity</span>
            </div>
            <div className="space-y-4">
              {isLoadingStats ? (
                <p className="text-sm text-text-secondary dark:text-gray-400">Loading activity...</p>
              ) : recentActions.length === 0 ? (
                <p className="text-sm text-text-secondary dark:text-gray-400">No recent activity found.</p>
              ) : (
                recentActions.map((action) => (
                  <div key={action.id || action._id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.targetType === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        action.targetType === 'lesson' ? 'bg-red-100 dark:bg-red-900/30' :
                          action.targetType === 'feature' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            'bg-green-100 dark:bg-green-900/30'
                      }`}>
                      {action.targetType === 'user' && <HiOutlineUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {action.targetType === 'lesson' && <HiOutlineBookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {['feature', 'tag'].includes(action.targetType) && <HiOutlineSparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                      {action.targetType === 'report' && <HiOutlineFlag className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text dark:text-white capitalize">{action.action.replace('-', ' ')}</p>
                      <p className="text-xs text-text-secondary dark:text-gray-400 truncate">{action.summary}</p>
                    </div>
                    <span className="text-xs text-text-muted dark:text-gray-500 whitespace-nowrap">{formatTimeAgo(action.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-text dark:text-white mb-5">Activity Summary</h3>

            <div className="space-y-6">
              {/* This Week */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text dark:text-white">This Week</span>
                  <span className="text-lg font-bold text-cherry">{stats.actionsThisWeek}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-cherry rounded-full h-2 transition-all duration-500"
                    style={{ width: `${Math.min((stats.actionsThisWeek / 20) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">{stats.actionsThisWeek} actions performed</p>
              </div>

              {/* This Month */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text dark:text-white">This Month</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.actionsThisMonth}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${Math.min((stats.actionsThisMonth / 60) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">{stats.actionsThisMonth} actions performed</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-text dark:text-white">Admin</p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">Role Status</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-text dark:text-white">Active</p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">Account Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-text dark:text-white mb-5">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Full Name</label>
                <p className="text-text dark:text-white font-medium">{userProfile.name || userProfile.displayName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Email Address</label>
                <p className="text-text dark:text-white font-medium">{userProfile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Role</label>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium rounded-full">
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  Admin
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Member Since</label>
                <p className="text-text dark:text-white font-medium">{formatDate(userProfile.metadata?.creationTime || userProfile.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Last Login</label>
                <p className="text-text dark:text-white font-medium">{formatDateTime(userProfile.metadata?.lastSignInTime || new Date())}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">Status</label>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text dark:text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-text dark:text-white"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Photo Preview */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={editFormData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name || 'User')}&background=random`}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cherry rounded-lg flex items-center justify-center">
                      <HiOutlineCamera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text dark:text-white mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-text dark:text-white focus:border-cherry focus:ring-0 focus:outline-none"
                    placeholder="Your display name"
                  />
                </div>

                {/* Photo URL Input */}
                <div>
                  <label htmlFor="photoURL" className="block text-sm font-medium text-text dark:text-white mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    id="photoURL"
                    name="photoURL"
                    value={editFormData.photoURL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-text dark:text-white focus:border-cherry focus:ring-0 focus:outline-none"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-text dark:text-white mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-text-secondary dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted dark:text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-cherry text-white rounded-xl font-medium hover:bg-cherry-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default AdminProfile;
