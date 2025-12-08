// User Activity Log Page - LifeCherry
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  HiOutlineClipboardDocumentList, 
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUser
} from 'react-icons/hi2';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import apiClient from '../../utils/apiClient';
import useAuth from '../../hooks/useAuth';

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getActionDetails = (action) => {
  const details = {
    'create': { 
      icon: HiOutlineCheckCircle, 
      label: 'Created', 
      bg: 'bg-green-50',
      border: 'border-l-4 border-green-500',
      badge: 'bg-green-100 text-green-800'
    },
    'update': { 
      icon: HiOutlinePencilSquare, 
      label: 'Updated', 
      bg: 'bg-blue-50',
      border: 'border-l-4 border-blue-500',
      badge: 'bg-blue-100 text-blue-800'
    },
    'delete': { 
      icon: HiOutlineTrash, 
      label: 'Deleted', 
      bg: 'bg-red-50',
      border: 'border-l-4 border-red-500',
      badge: 'bg-red-100 text-red-800'
    },
    'view': { 
      icon: HiOutlineEye, 
      label: 'Viewed', 
      bg: 'bg-gray-50',
      border: 'border-l-4 border-gray-500',
      badge: 'bg-gray-100 text-gray-800'
    },
  };
  return details[action] || details.update;
};

const getTargetDetails = (targetType) => {
  const details = {
    'lesson': { icon: HiOutlineClipboardDocumentList, label: 'Lesson', color: 'text-cherry' },
    'profile': { icon: HiOutlineUser, label: 'Profile', color: 'text-blue-600' },
  };
  return details[targetType] || { icon: HiOutlineClipboardDocumentList, label: targetType, color: 'text-gray-600' };
};

const ActivityLog = () => {
  useDocumentTitle('Activity Log');
  const { authLoading } = useAuth();
  const [filterType, setFilterType] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-activity'],
    enabled: !authLoading,
    queryFn: async () => {
      const res = await apiClient.get('/audit/user', { params: { limit: 100 } });
      return res.data;
    },
  });

  const changes = useMemo(() => {
    const allChanges = data?.changes || [];
    if (filterType === 'all') return allChanges;
    return allChanges.filter(change => change.targetType === filterType);
  }, [data, filterType]);

  const stats = useMemo(() => ({
    total: changes.length,
    created: changes.filter(c => c.action === 'create').length,
    updated: changes.filter(c => c.action === 'update').length,
    deleted: changes.filter(c => c.action === 'delete').length,
  }), [changes]);

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <div className="p-2 bg-cherry-50 rounded-lg">
              <HiOutlineClipboardDocumentList className="w-7 h-7 text-cherry" />
            </div>
            Activity Log
          </h1>
          <p className="text-text-secondary text-sm mt-1">View all actions and changes across your account</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border-2 border-red-200 text-sm font-medium">
            {error.message || 'Failed to load activity log'}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap p-3 bg-gray-50 rounded-xl border border-gray-200">
          {[
            { value: 'all', label: 'All Activity', count: stats.total },
            { value: 'lesson', label: 'Lessons', count: changes.filter(c => c.targetType === 'lesson').length },
            { value: 'profile', label: 'Profile', count: changes.filter(c => c.targetType === 'profile').length },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                filterType === filter.value
                  ? 'bg-cherry text-white shadow-lg'
                  : 'bg-white text-text-secondary border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {filter.label}
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                filterType === filter.value ? 'bg-white/30' : 'bg-gray-200'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        {changes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <div className="text-2xl font-bold text-text">{stats.total}</div>
              <p className="text-xs text-text-muted font-medium mt-1">Total Activities</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.created}</div>
              <p className="text-xs text-green-700 font-medium mt-1">Created</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.updated}</div>
              <p className="text-xs text-blue-700 font-medium mt-1">Updated</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
              <p className="text-xs text-red-700 font-medium mt-1">Deleted</p>
            </div>
          </div>
        )}

        {/* Activity Log List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-cherry" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-text-secondary font-medium">Loading activity log...</span>
              </div>
            </div>
          ) : changes.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <HiOutlineClipboardDocumentList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-semibold text-text-secondary">No activity yet</div>
              <p className="text-sm text-text-muted mt-2">Your actions will be logged and displayed here</p>
            </div>
          ) : (
            changes.map((item, index) => {
              const actionDetails = getActionDetails(item.action);
              const targetDetails = getTargetDetails(item.targetType);
              const ActionIcon = actionDetails.icon;
              const TargetIcon = targetDetails.icon;
              
              return (
                <div 
                  key={item.id || index} 
                  className={`${actionDetails.border} p-4 rounded-lg bg-white border-b-2 border-r border-gray-200 hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex gap-4">
                    {/* Action Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={`p-2 rounded-lg ${actionDetails.bg}`}>
                        <ActionIcon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${actionDetails.badge}`}>
                            {actionDetails.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${targetDetails.color}`}>
                            <TargetIcon className="w-4 h-4" />
                            {targetDetails.label}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted font-medium">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {item.summary || 'No details available'}
                      </p>

                      {/* Metadata */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {Object.entries(item.metadata).map(([key, value]) => (
                              <div key={key} className="flex gap-1">
                                <span className="text-text-muted font-medium">{key}:</span>
                                <span className="text-text-secondary truncate">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Timeline Info */}
        {changes.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <p className="font-medium">Viewing {changes.length} of {data?.total || 0} total activities</p>
            <p className="text-xs text-blue-700 mt-1">Activities are sorted by most recent first</p>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default ActivityLog;
