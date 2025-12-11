// Admin Trash Management Page - LifeCherry
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocumentList,
  HiOutlineUser
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import apiClient from '../../utils/apiClient';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import useAuth from '../../hooks/useAuth';

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

const getItemTypeDetails = (itemType) => {
  const details = {
    'lesson': { icon: HiOutlineClipboardDocumentList, label: 'Lesson', color: 'text-cherry' },
    'profile': { icon: HiOutlineUser, label: 'Profile', color: 'text-blue-600' },
  };
  return details[itemType] || { icon: HiOutlineTrash, label: itemType, color: 'text-gray-600' };
};

const AdminTrash = () => {
  useDocumentTitle('Trash Management');
  const { userProfile, authLoading } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const items = useMemo(() => data?.items || [], [data]);

  const handleRestore = async (id, itemTitle) => {
    setRestoringId(id);
    try {
      await apiClient.post(`/admin/trash/${id}/restore`);
      toast.success(`Restored "${itemTitle}"`);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore item');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id, itemTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete "${itemTitle}"? This cannot be undone.`)) {
      setDeletingId(id);
      try {
        await apiClient.delete(`/admin/trash/${id}/permanent`);
        toast.success(`Permanently deleted "${itemTitle}"`);
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete item');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('This will permanently delete all items in trash older than 30 days. This cannot be undone.')) {
      try {
        const res = await apiClient.post('/admin/trash/empty');
        toast.success(`${res.data.deletedCount} items permanently deleted`);
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to empty trash');
      }
    }
  };

  // Only admins can access this page
  if (!authLoading && userProfile?.role !== 'admin') {
    return (
      <PageLoader>
        <div className="p-8 text-center bg-red-50 rounded-xl border-2 border-red-200">
          <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-semibold">Access Denied</p>
          <p className="text-red-600 text-sm mt-2">Only administrators can access the trash management page</p>
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
          description="Manage deleted items. Restore or permanently delete them."
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border-2 border-red-200 text-sm font-medium">
            {error.message || 'Failed to load trash'}
          </div>
        )}

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All Items' },
              { value: 'lesson', label: 'Lessons' },
              { value: 'profile', label: 'Profiles' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${filterType === filter.value
                    ? 'bg-cherry text-white shadow-lg'
                    : 'bg-gray-100 text-text-secondary border border-gray-200 hover:bg-gray-200'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
            >
              Empty Trash
            </button>
          )}
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{items.length}</div>
              <p className="text-xs text-red-700 font-medium mt-1">Items in Trash</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {items.filter(i => i.itemType === 'lesson').length}
              </div>
              <p className="text-xs text-purple-700 font-medium mt-1">Deleted Lessons</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(i => i.itemType === 'profile').length}
              </div>
              <p className="text-xs text-blue-700 font-medium mt-1">Deleted Profiles</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-xs font-bold text-gray-600 truncate">
                {items[0]?.deletedByName || 'Unknown'}
              </div>
              <p className="text-xs text-gray-700 font-medium mt-1">Most Recent Delete</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-cherry" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-text-secondary font-medium">Loading trash...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <HiOutlineTrash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-semibold text-text-secondary">Trash is empty</div>
              <p className="text-sm text-text-muted mt-2">Deleted items will appear here</p>
            </div>
          ) : (
            items.map((item) => {
              const itemType = getItemTypeDetails(item.itemType);
              const ItemTypeIcon = itemType.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white border-l-4 border-red-500 border-b-2 border-r border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className="p-2 rounded-lg bg-red-50">
                        <ItemTypeIcon className="w-5 h-5 text-red-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800`}>
                            Deleted
                          </span>
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${itemType.color}`}>
                            <ItemTypeIcon className="w-4 h-4" />
                            {itemType.label}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted font-medium">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>

                      {/* Item Details */}
                      <p className="text-sm text-text-secondary font-semibold mb-1">
                        {item.itemData?.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-text-muted mb-3">
                        Deleted by: <span className="font-medium">{item.deletedByName || item.deletedBy}</span>
                        {item.itemOwner && ` | Owner: ${item.itemOwnerName || item.itemOwner}`}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleRestore(item.id, item.itemData?.title || 'Item')}
                          disabled={restoringId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
                        >
                          <HiOutlineArrowUturnLeft className="w-4 h-4" />
                          {restoringId === item.id ? 'Restoring...' : 'Restore'}
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id, item.itemData?.title || 'Item')}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                          <HiOutlineXMark className="w-4 h-4" />
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Box */}
        {items.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <p className="font-medium">How Trash Works</p>
            <ul className="list-disc list-inside text-xs text-blue-700 mt-2 space-y-1">
              <li>Items are kept in trash for up to 30 days</li>
              <li>You can restore items to bring them back</li>
              <li>Permanently deleted items cannot be recovered</li>
              <li>Auto-cleanup runs every 30 days</li>
            </ul>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default AdminTrash;
