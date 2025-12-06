// Manage Users Page - LifeCherry Admin
import React, { useState, useMemo } from 'react';
import { 
  HiOutlineUsers,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowsUpDown,
  HiOutlineStar,
  HiOutlineBookOpen,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { users } from '../../../data/users';
import { lessons } from '../../../data/lessons';

const ManageUsers = () => {
  useDocumentTitle('Manage Users');
  
  // State
  const [usersData, setUsersData] = useState(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPremium, setFilterPremium] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Get lesson count for each user
  const getUserLessonsCount = (email) => {
    return lessons.filter(l => l.creatorEmail === email).length;
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    let result = usersData.map(user => ({
      ...user,
      lessonsCount: getUserLessonsCount(user.email)
    }));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    if (filterRole) {
      result = result.filter(user => user.role === filterRole);
    }

    if (filterPremium) {
      result = result.filter(user => 
        filterPremium === 'premium' ? user.isPremium : !user.isPremium
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'lessons':
        result.sort((a, b) => b.lessonsCount - a.lessonsCount);
        break;
      default:
        break;
    }

    return result;
  }, [usersData, searchQuery, filterRole, filterPremium, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle promote to admin
  const handlePromoteToAdmin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setUsersData(prev => prev.map(user => 
        user._id === selectedUser._id ? { ...user, role: 'admin' } : user
      ));
      toast.success(`${selectedUser.name} has been promoted to Admin!`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      setIsSubmitting(false);
    }, 1000);
  };

  // Handle demote from admin
  const handleDemoteFromAdmin = (user) => {
    setUsersData(prev => prev.map(u => 
      u._id === user._id ? { ...u, role: 'user' } : u
    ));
    toast.success(`${user.name} has been demoted to User`);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setUsersData(prev => prev.filter(user => user._id !== selectedUser._id));
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      setIsSubmitting(false);
    }, 1000);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('');
    setFilterPremium('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterRole || filterPremium || sortBy !== 'newest';

  // Stats
  const stats = {
    total: usersData.length,
    admins: usersData.filter(u => u.role === 'admin').length,
    premium: usersData.filter(u => u.isPremium).length,
    regular: usersData.filter(u => !u.isPremium).length
  };

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">Manage Users</h1>
            </div>
            <p className="text-text-secondary">View and manage all registered users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.total}</p>
                <p className="text-xs text-text-secondary">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <HiOutlineShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.admins}</p>
                <p className="text-xs text-text-secondary">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <HiOutlineStar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.premium}</p>
                <p className="text-xs text-text-secondary">Premium Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.regular}</p>
                <p className="text-xs text-text-secondary">Free Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                  showFilters ? 'border-cherry bg-cherry-50 text-cherry' : 'border-gray-200 text-text-secondary hover:border-cherry'
                }`}
              >
                <HiOutlineFunnel className="w-5 h-5" />
                Filters
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2.5 text-sm text-cherry hover:bg-cherry-50 rounded-xl transition-colors"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Plan</label>
                <select
                  value={filterPremium}
                  onChange={(e) => setFilterPremium(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
                >
                  <option value="">All Plans</option>
                  <option value="premium">Premium</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="lessons">Most Lessons</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-text">{user.name}</h4>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <HiOutlineStar className="w-3.5 h-3.5" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <HiOutlineBookOpen className="w-4 h-4 text-text-muted" />
                        <span className="font-medium text-text">{user.lessonsCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPromoteModal(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Promote to Admin"
                          >
                            <HiOutlineShieldCheck className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteFromAdmin(user)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Demote to User"
                          >
                            <HiOutlineShieldCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineUsers className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No users found</h3>
              <p className="text-text-secondary">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Promote Modal */}
        {showPromoteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Promote to Admin</h3>
                  <p className="text-sm text-text-secondary">This action can be reversed</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text">{selectedUser.name}</h4>
                    <p className="text-sm text-text-secondary">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                Are you sure you want to promote <strong>{selectedUser.name}</strong> to Admin? 
                They will have access to all admin features.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteToAdmin}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Promoting...' : 'Promote to Admin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Delete User</h3>
                  <p className="text-sm text-text-secondary">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text">{selectedUser.name}</h4>
                    <p className="text-sm text-text-secondary">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
                All their data including lessons will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default ManageUsers;
