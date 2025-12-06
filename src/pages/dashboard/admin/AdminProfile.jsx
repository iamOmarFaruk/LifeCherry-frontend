// Admin Profile Page - LifeCherry Admin
import React, { useState, useMemo } from 'react';
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
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineSparkles
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { lessons } from '../../../data/lessons';
import { users } from '../../../data/users';
import { reports } from '../../../data/reports';

const AdminProfile = () => {
  useDocumentTitle('Admin Profile');
  
  // Admin user state
  const [adminUser, setAdminUser] = useState({
    _id: 'admin1',
    name: 'Omar Faruk',
    email: 'omar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    isPremium: true,
    createdAt: '2025-01-01T10:00:00Z',
    lastLogin: '2025-12-06T08:30:00Z'
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: adminUser.name,
    photoURL: adminUser.photoURL
  });

  // Activity stats (mock data)
  const activityStats = useMemo(() => {
    const totalUsers = users.length;
    const totalLessons = lessons.length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const featuredLessons = lessons.filter(l => l.isFeatured).length;
    
    return {
      usersManaged: totalUsers,
      lessonsModerated: Math.floor(totalLessons * 0.7),
      reportsHandled: resolvedReports,
      lessonsFeatured: featuredLessons,
      actionsThisMonth: 47,
      actionsThisWeek: 12
    };
  }, []);

  // Recent admin actions (mock)
  const recentActions = [
    { id: 1, action: 'Promoted user to Admin', target: 'John Doe', time: '2 hours ago', type: 'user' },
    { id: 2, action: 'Deleted inappropriate lesson', target: 'Spam Content', time: '5 hours ago', type: 'lesson' },
    { id: 3, action: 'Featured lesson', target: 'The Art of Patience', time: '1 day ago', type: 'feature' },
    { id: 4, action: 'Resolved 3 reports', target: 'Multiple Lessons', time: '2 days ago', type: 'report' },
    { id: 5, action: 'Reviewed new user', target: 'Sarah Wilson', time: '3 days ago', type: 'user' },
  ];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

    // Simulate API call
    setTimeout(() => {
      setAdminUser(prev => ({
        ...prev,
        name: editFormData.name,
        photoURL: editFormData.photoURL
      }));
      setShowEditModal(false);
      setIsSubmitting(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };

  // Open edit modal
  const openEditModal = () => {
    setEditFormData({
      name: adminUser.name,
      photoURL: adminUser.photoURL
    });
    setShowEditModal(true);
  };

  return (
    <PageLoader>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Profile Info */}
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={adminUser.photoURL}
                  alt={adminUser.name}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Name and Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-text">{adminUser.name}</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 text-text-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <HiOutlineEnvelope className="w-4 h-4" />
                    {adminUser.email}
                  </span>
                  <span className="hidden sm:block">•</span>
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="w-4 h-4" />
                    Member since {formatDate(adminUser.createdAt)}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={openEditModal}
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
          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{activityStats.usersManaged}</p>
                <p className="text-sm text-text-secondary">Users Managed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cherry-50 rounded-xl flex items-center justify-center">
                <HiOutlineBookOpen className="w-6 h-6 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{activityStats.lessonsModerated}</p>
                <p className="text-sm text-text-secondary">Lessons Moderated</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{activityStats.reportsHandled}</p>
                <p className="text-sm text-text-secondary">Reports Handled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <HiOutlineSparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{activityStats.lessonsFeatured}</p>
                <p className="text-sm text-text-secondary">Lessons Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Actions */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text">Recent Actions</h3>
              <span className="text-sm text-text-secondary">Last 7 days</span>
            </div>
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    action.type === 'user' ? 'bg-blue-100' :
                    action.type === 'lesson' ? 'bg-red-100' :
                    action.type === 'feature' ? 'bg-amber-100' :
                    'bg-green-100'
                  }`}>
                    {action.type === 'user' && <HiOutlineUsers className="w-5 h-5 text-blue-600" />}
                    {action.type === 'lesson' && <HiOutlineBookOpen className="w-5 h-5 text-red-600" />}
                    {action.type === 'feature' && <HiOutlineSparkles className="w-5 h-5 text-amber-600" />}
                    {action.type === 'report' && <HiOutlineFlag className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{action.action}</p>
                    <p className="text-xs text-text-secondary truncate">{action.target}</p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">{action.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-text mb-5">Activity Summary</h3>
            
            <div className="space-y-6">
              {/* This Week */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">This Week</span>
                  <span className="text-lg font-bold text-cherry">{activityStats.actionsThisWeek}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-cherry rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${(activityStats.actionsThisWeek / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">12 of 20 weekly goal</p>
              </div>

              {/* This Month */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">This Month</span>
                  <span className="text-lg font-bold text-indigo-600">{activityStats.actionsThisMonth}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${(activityStats.actionsThisMonth / 60) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">47 of 60 monthly goal</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-text">98%</p>
                  <p className="text-xs text-text-secondary">Response Rate</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-text">2.3h</p>
                  <p className="text-xs text-text-secondary">Avg. Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-text mb-5">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <p className="text-text font-medium">{adminUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                <p className="text-text font-medium">{adminUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  Admin
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Member Since</label>
                <p className="text-text font-medium">{formatDate(adminUser.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Last Login</label>
                <p className="text-text font-medium">{formatDateTime(adminUser.lastLogin)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Photo Preview */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={editFormData.photoURL || 'https://via.placeholder.com/100'}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cherry rounded-lg flex items-center justify-center">
                      <HiOutlineCamera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
                    placeholder="Your display name"
                  />
                </div>

                {/* Photo URL Input */}
                <div>
                  <label htmlFor="photoURL" className="block text-sm font-medium text-text mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    id="photoURL"
                    name="photoURL"
                    value={editFormData.photoURL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={adminUser.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-text-secondary cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1">Email cannot be changed for security reasons</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors"
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
