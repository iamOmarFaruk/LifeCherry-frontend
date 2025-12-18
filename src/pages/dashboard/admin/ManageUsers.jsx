// Manage Users Page - LifeCherry Admin
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  HiOutlineCheckCircle,
  HiOutlineArchiveBox,
  HiOutlineArrowPath,
  HiOutlineEnvelope,
  HiOutlineChatBubbleBottomCenterText
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient from '../../../utils/apiClient';
import Tooltip from '../../../components/shared/Tooltip';

const ManageUsers = () => {
  useDocumentTitle('Manage Users');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPremium, setFilterPremium] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  const ITEMS_PER_PAGE = 10;

  // Users query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', currentPage, searchQuery, filterRole, filterPremium, filterStatus],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        role: filterRole,
        isPremium: filterPremium === 'premium' ? 'true' : filterPremium === 'free' ? 'false' : undefined,
        status: filterStatus,
      };
      const res = await apiClient.get('/users', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Reactivation requests query
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['reactivation-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/users/reactivation-requests');
      return res.data;
    },
  });

  const usersData = data?.users || [];
  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);
  const reactivationRequests = requestsData?.users || [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle promote to admin
  const handlePromoteToAdmin = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.patch(`/users/${selectedUser.email}/role`, { role: 'admin' });
      toast.success(`${selectedUser.name} has been promoted to Admin!`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error('Failed to promote user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle demote from admin
  const handleDemoteFromAdmin = async (user) => {
    if (!window.confirm(`Are you sure you want to demote ${user.name}?`)) return;
    try {
      await apiClient.patch(`/users/${user.email}/role`, { role: 'user' });
      toast.success(`${user.name} has been demoted to User`);
      refetch();
    } catch (error) {
      toast.error('Failed to demote user');
    }
  };

  // Handle archive user with reason
  const handleArchiveUser = async () => {
    if (!archiveReason.trim()) {
      toast.error('Please provide a reason for archiving this user');
      return;
    }
    try {
      setIsSubmitting(true);
      await apiClient.post('/users/manage-status', {
        email: selectedUser.email,
        action: 'archive',
        reason: archiveReason.trim()
      });
      toast.success(`User archived successfully`);
      setShowArchiveModal(false);
      setSelectedUser(null);
      setArchiveReason('');
      refetch();
      refetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle restore user
  const handleRestoreUser = async (user) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/users/manage-status', { email: user.email, action: 'restore' });
      toast.success(`User restored successfully`);
      refetch();
      refetchRequests();
    } catch (error) {
      toast.error('Failed to restore user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve reactivation request
  const handleApproveReactivation = async (user) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/users/manage-status', {
        email: user.email,
        action: 'approve-reactivation'
      });
      toast.success(`${user.name}'s account has been reactivated!`);
      setShowRequestModal(false);
      setSelectedUser(null);
      refetch();
      refetchRequests();
    } catch (error) {
      toast.error('Failed to approve reactivation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject reactivation request
  const handleRejectReactivation = async (user) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/users/manage-status', {
        email: user.email,
        action: 'reject-reactivation'
      });
      toast.success(`Reactivation request rejected`);
      setShowRequestModal(false);
      setSelectedUser(null);
      refetchRequests();
    } catch (error) {
      toast.error('Failed to reject reactivation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('');
    setFilterPremium('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterRole || filterPremium || filterStatus;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DashboardPageHeader
        icon={HiOutlineUsers}
        title="Manage Users"
        description="View and manage all registered users"
      />

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 border border-border dark:border-gray-700 w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users'
            ? 'bg-cherry text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <HiOutlineUsers className="w-4 h-4" />
            All Users
          </span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'requests'
            ? 'bg-cherry text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <HiOutlineEnvelope className="w-4 h-4" />
            Reactivation Requests
            {reactivationRequests.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${activeTab === 'requests'
                ? 'bg-white text-cherry'
                : 'bg-cherry text-white'
                }`}>
                {reactivationRequests.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-4 transition-colors">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${showFilters ? 'border-cherry bg-cherry-50 text-cherry dark:bg-cherry-900/20' : 'border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:border-cherry dark:hover:border-cherry'
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
              <div className="mt-4 pt-4 border-t border-border dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Plan</label>
                  <select
                    value={filterPremium}
                    onChange={(e) => setFilterPremium(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  >
                    <option value="">All Plans</option>
                    <option value="premium">Premium</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="disable_requested">Disable Requested</option>
                    <option value="archived">Archived</option>
                    <option value="reactivation_requested">Reactivation Requested</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-border dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {usersData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-text dark:text-white">{user.name}</h4>
                            <p className="text-sm text-text-secondary dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                            <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'archived' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Archived
                          </span>
                        ) : user.status === 'disable_requested' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Disable Requested
                          </span>
                        ) : user.status === 'reactivation_requested' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <HiOutlineEnvelope className="w-3.5 h-3.5" />
                            Reactivation Req.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'archived' || user.status === 'reactivation_requested' ? (
                            <Tooltip content="Restore User">
                              <button
                                onClick={() => handleRestoreUser(user)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              >
                                <HiOutlineArrowPath className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Archive User">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setArchiveReason('');
                                  setShowArchiveModal(true);
                                }}
                                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                              >
                                <HiOutlineArchiveBox className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          )}

                          {user.role !== 'admin' ? (
                            <Tooltip content="Promote to Admin">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowPromoteModal(true);
                                }}
                                className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              >
                                <HiOutlineShieldCheck className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Demote to User">
                              <button
                                onClick={() => handleDemoteFromAdmin(user)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                              >
                                <HiOutlineShieldCheck className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {usersData.length === 0 && (
              <div className="text-center py-12">
                <HiOutlineUsers className="w-12 h-12 text-text-muted dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text dark:text-white mb-2">No users found</h3>
                <p className="text-text-secondary dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, data?.total || 0)} of {data?.total || 0} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reactivation Requests Tab Content */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden transition-colors">
          {requestsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cherry"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading requests...</p>
            </div>
          ) : reactivationRequests.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineEnvelope className="w-12 h-12 text-text-muted dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text dark:text-white mb-2">No pending requests</h3>
              <p className="text-text-secondary dark:text-gray-400">All reactivation requests have been processed</p>
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-gray-700">
              {reactivationRequests.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text dark:text-white">{user.name}</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          <HiOutlineEnvelope className="w-3 h-3" />
                          Pending Request
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mb-3">{user.email}</p>

                      {/* Archive Reason */}
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-3 mb-3">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Original Archive Reason:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{user.archiveReason || 'No reason provided'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Archived on: {formatDateTime(user.archivedAt)}</p>
                      </div>

                      {/* Reactivation Message */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3 mb-4">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                          <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />
                          User's Reactivation Message:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{user.reactivationMessage}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Requested on: {formatDateTime(user.reactivationRequestDate)}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApproveReactivation(user)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          Approve & Reactivate
                        </button>
                        <button
                          onClick={() => handleRejectReactivation(user)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                        >
                          <HiOutlineXMark className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Archive Modal with Reason */}
      {showArchiveModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <HiOutlineArchiveBox className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text dark:text-white">Archive User</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">This will disable their account</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-text dark:text-white">{selectedUser.name}</h4>
                  <p className="text-sm text-text-secondary dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text dark:text-gray-300 mb-2">
                Reason for archiving <span className="text-red-500">*</span>
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Explain why this account is being disabled..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700/50 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                This reason will be shown to the user when they try to login.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setSelectedUser(null);
                  setArchiveReason('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveUser}
                disabled={isSubmitting || !archiveReason.trim()}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Archiving...' : 'Archive User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <HiOutlineShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text dark:text-white">Promote to Admin</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">This action can be reversed</p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-text dark:text-white">{selectedUser.name}</h4>
                  <p className="text-sm text-text-secondary dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <p className="text-text-secondary dark:text-gray-300 mb-6">
              Are you sure you want to promote <strong>{selectedUser.name}</strong> to Admin?
              They will have access to all admin features.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
    </div>
  );
};

export default ManageUsers;
