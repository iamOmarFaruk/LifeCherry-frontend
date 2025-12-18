// Admin Trash Management Page - LifeCherry
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArchiveBox,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient from '../../../utils/apiClient';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import Tooltip from '../../../components/shared/Tooltip';
import useAuth from '../../../hooks/useAuth';

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const getItemTypeDetails = (itemType) => {
  const details = {
    'lesson': { icon: HiOutlineBookOpen, label: 'Lesson', color: 'text-cherry', bgColor: 'bg-cherry-50 dark:bg-cherry/20' },
    'profile': { icon: HiOutlineUser, label: 'Profile', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
  };
  return details[itemType] || { icon: HiOutlineTrash, label: itemType, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
};

const AdminTrash = () => {
  useDocumentTitle('Trash Management');
  const { userProfile, authLoading } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-trash', filterType],
    enabled: !authLoading && userProfile?.role === 'admin',
    queryFn: async () => {
      const params = { limit: 100 };
      if (filterType !== 'all') params.itemType = filterType;
      const res = await apiClient.get('/admin/trash', { params });
      return res.data;
    },
  });

  const allItems = useMemo(() => data?.items || [], [data]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.itemData?.title?.toLowerCase().includes(query) ||
      item.deletedByName?.toLowerCase().includes(query) ||
      item.itemOwnerName?.toLowerCase().includes(query) ||
      item.deletedBy?.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: allItems.length,
    lessons: allItems.filter(i => i.itemType === 'lesson').length,
    profiles: allItems.filter(i => i.itemType === 'profile').length,
  }), [allItems]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRestore = async (id, itemTitle) => {
    setRestoringId(id);
    try {
      await apiClient.post(`/admin/trash/${id}/restore`);
      toast.success(`Restored "${itemTitle}" successfully`);
      setShowDetailsModal(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore item');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete.id);
    try {
      await apiClient.delete(`/admin/trash/${itemToDelete.id}/permanent`);
      toast.success(`Permanently deleted "${itemToDelete.itemData?.title || 'Item'}"`);
      setShowDeleteModal(false);
      setShowDetailsModal(false);
      setItemToDelete(null);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };



  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const openDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Only admins can access this page
  if (!authLoading && userProfile?.role !== 'admin') {
    return (
      <PageLoader>
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
          <HiOutlineExclamationTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h3>
          <p className="text-red-600 dark:text-red-300">Only administrators can access the trash management page</p>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Header */}
        <DashboardPageHeader
          icon={HiOutlineTrash}
          title="Trash Management"
          description="Review, restore, or permanently delete items that users have removed"
        />

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-medium flex items-center gap-3">
            <HiOutlineExclamationTriangle className="w-5 h-5 flex-shrink-0" />
            {error.message || 'Failed to load trash items'}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.total}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cherry-50 dark:bg-cherry/20 rounded-lg flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.lessons}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Deleted Lessons</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.profiles}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Deleted Profiles</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineArchiveBox className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">∞</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Permanent Storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, owner, or deleted by..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-text dark:text-white placeholder:text-gray-400 focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterType === 'all'
                  ? 'bg-cherry text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterType('lesson'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterType === 'lesson'
                  ? 'bg-cherry text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                Lessons
              </button>
              <button
                onClick={() => { setFilterType('profile'); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterType === 'profile'
                  ? 'bg-cherry text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                Profiles
              </button>
            </div>


          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-border dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Deleted By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Deleted On
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-cherry" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-text-secondary dark:text-gray-400 font-medium">Loading trash items...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <HiOutlineArchiveBox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-text dark:text-white mb-2">
                        {searchQuery ? 'No items match your search' : 'Trash is empty'}
                      </h3>
                      <p className="text-text-secondary dark:text-gray-400">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Deleted items will appear here for 30 days'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const itemType = getItemTypeDetails(item.itemType);
                    const ItemTypeIcon = itemType.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${itemType.bgColor} flex items-center justify-center flex-shrink-0`}>
                              <ItemTypeIcon className={`w-5 h-5 ${itemType.color}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-text dark:text-white truncate max-w-xs">
                                {item.itemData?.title || 'Untitled'}
                              </h4>
                              {item.itemOwnerName && (
                                <p className="text-xs text-text-secondary dark:text-gray-400">
                                  Owner: {item.itemOwnerName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${itemType.bgColor} ${itemType.color}`}>
                            <ItemTypeIcon className="w-3.5 h-3.5" />
                            {itemType.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-text dark:text-white">
                              {item.deletedByName || 'Unknown'}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">
                              {item.deletedBy}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-text dark:text-white">
                              {formatTimeAgo(item.createdAt)}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip content="View Details">
                              <button
                                onClick={() => openDetailsModal(item)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <HiOutlineEye className="w-5 h-5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Restore">
                              <button
                                onClick={() => handleRestore(item.id, item.itemData?.title || 'Item')}
                                disabled={restoringId === item.id}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <HiOutlineArrowUturnLeft className="w-5 h-5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete Permanently">
                              <button
                                onClick={() => openDeleteConfirmation(item)}
                                disabled={deletingId === item.id}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <HiOutlineXMark className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text dark:text-white"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-text dark:text-white'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text dark:text-white"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Trash Management Info</p>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300/80">
                <li>• Items are <span className="font-semibold">kept forever</span> until manually deleted by an admin</li>
                <li>• Use <span className="font-semibold">Restore</span> to bring items back to their original location</li>
                <li>• <span className="font-semibold">Permanently deleted</span> items cannot be recovered</li>
                <li>• Review all deleted content before taking any action</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-border dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const itemType = getItemTypeDetails(selectedItem.itemType);
                      const ItemTypeIcon = itemType.icon;
                      return (
                        <div className={`w-12 h-12 rounded-xl ${itemType.bgColor} flex items-center justify-center`}>
                          <ItemTypeIcon className={`w-6 h-6 ${itemType.color}`} />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-lg font-bold text-text dark:text-white">
                        {selectedItem.itemData?.title || 'Untitled Item'}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 mt-1`}>
                        <HiOutlineTrash className="w-3 h-3" />
                        In Trash
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedItem(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-text dark:text-white"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {/* Item Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-text dark:text-white mb-3">Item Details</h4>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary dark:text-gray-400">Type</p>
                        <p className="font-medium text-text dark:text-white capitalize">{selectedItem.itemType}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary dark:text-gray-400">Original ID</p>
                        <p className="font-medium text-text dark:text-white font-mono text-xs">{selectedItem.originalId}</p>
                      </div>
                    </div>

                    {selectedItem.itemData?.category && (
                      <div>
                        <p className="text-text-secondary dark:text-gray-400 text-sm">Category</p>
                        <span className="inline-block px-2 py-0.5 bg-cherry-50 dark:bg-cherry/20 text-cherry text-xs font-medium rounded-full mt-1">
                          {selectedItem.itemData.category}
                        </span>
                      </div>
                    )}

                    {selectedItem.itemData?.description && (
                      <div>
                        <p className="text-text-secondary dark:text-gray-400 text-sm">Description</p>
                        <p className="text-sm text-text dark:text-gray-200 mt-1">
                          {selectedItem.itemData.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Deletion Info */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                      <HiOutlineTrash className="w-4 h-4" />
                      Deletion Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70">Deleted By</p>
                        <p className="font-medium text-red-800 dark:text-red-300">{selectedItem.deletedByName || 'Unknown'}</p>
                        <p className="text-xs text-red-700/70 dark:text-red-300/70">{selectedItem.deletedBy}</p>
                      </div>
                      <div>
                        <p className="text-red-700/70 dark:text-red-300/70">Deleted On</p>
                        <p className="font-medium text-red-800 dark:text-red-300">{formatDateTime(selectedItem.createdAt)}</p>
                        <p className="text-xs text-red-700/70 dark:text-red-300/70">{formatTimeAgo(selectedItem.createdAt)}</p>
                      </div>
                    </div>

                    {selectedItem.itemOwner && (
                      <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                        <p className="text-red-700/70 dark:text-red-300/70 text-sm">Item Owner</p>
                        <p className="font-medium text-red-800 dark:text-red-300">{selectedItem.itemOwnerName || selectedItem.itemOwner}</p>
                      </div>
                    )}

                    {selectedItem.deletionReason && (
                      <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                        <p className="text-red-700/70 dark:text-red-300/70 text-sm">Reason</p>
                        <p className="font-medium text-red-800 dark:text-red-300">{selectedItem.deletionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRestore(selectedItem.id, selectedItem.itemData?.title || 'Item')}
                    disabled={restoringId === selectedItem.id}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <HiOutlineArrowUturnLeft className="w-5 h-5" />
                    {restoringId === selectedItem.id ? 'Restoring...' : 'Restore Item'}
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(selectedItem)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-white">Permanent Deletion</h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const itemType = getItemTypeDetails(itemToDelete.itemType);
                    const ItemTypeIcon = itemType.icon;
                    return (
                      <div className={`w-12 h-12 rounded-lg ${itemType.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <ItemTypeIcon className={`w-6 h-6 ${itemType.color}`} />
                      </div>
                    );
                  })()}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-text dark:text-white truncate">{itemToDelete.itemData?.title || 'Untitled'}</h4>
                    <p className="text-sm text-text-secondary dark:text-gray-400 capitalize">{itemToDelete.itemType}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary dark:text-gray-400 mb-6">
                Are you sure you want to permanently delete this item? This action is irreversible and the data cannot be recovered.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={deletingId === itemToDelete.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingId === itemToDelete.id ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default AdminTrash;
