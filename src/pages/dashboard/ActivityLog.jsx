// User Activity Page - LifeCherry
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineClipboardDocumentList, HiOutlineArrowPath } from 'react-icons/hi2';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import apiClient from '../../utils/apiClient';
import useAuth from '../../hooks/useAuth';

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActionBadge = (action) => {
  const badges = {
    'create': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'update': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'delete': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'view': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  };
  return badges[action] || badges.update;
};

const getTargetIcon = (targetType) => {
  return targetType === 'lesson' ? '📚' : targetType === 'profile' ? '👤' : '⚙️';
};

const ActivityLog = () => {
  useDocumentTitle('My Activity');
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

  return (
    <PageLoader>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="w-6 h-6 text-cherry" />
              My Activity
            </h1>
            <p className="text-text-secondary text-sm">Track all your lesson posts and profile changes.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text hover:border-cherry hover:text-cherry transition-colors"
          >
            <HiOutlineArrowPath className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm">{error.message || 'Failed to load activity'}</div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All Activity' },
            { value: 'lesson', label: '📚 Lessons Posted' },
            { value: 'profile', label: '👤 Profile Changes' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === filter.value
                  ? 'bg-cherry text-white'
                  : 'bg-gray-100 text-text hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border bg-gray-50">
                  <th className="py-3 px-4 font-semibold">When</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-text-secondary text-center" colSpan={4}>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading activity...
                      </div>
                    </td>
                  </tr>
                ) : changes.length === 0 ? (
                  <tr>
                    <td className="py-8 px-4 text-text-secondary text-center" colSpan={4}>
                      <div className="text-lg font-medium">No activity yet</div>
                      <p className="text-sm text-text-muted mt-1">Your lesson posts and profile changes will appear here</p>
                    </td>
                  </tr>
                ) : (
                  changes.map((item) => {
                    const actionBadge = getActionBadge(item.action);
                    const icon = getTargetIcon(item.targetType);
                    
                    return (
                      <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-text-secondary text-xs font-medium">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${actionBadge.bg} ${actionBadge.text} ${actionBadge.border}`}>
                            {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center text-lg">{icon}</td>
                        <td className="py-3 px-4 text-text-secondary max-w-xs truncate">
                          {item.summary || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        {changes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {changes.filter(c => c.action === 'create' && c.targetType === 'lesson').length}
              </div>
              <p className="text-sm text-green-700 font-medium mt-1">Lessons Posted</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {changes.filter(c => c.action === 'update').length}
              </div>
              <p className="text-sm text-blue-700 font-medium mt-1">Updates Made</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {new Date(Math.max(...changes.map(c => new Date(c.createdAt)))).toLocaleDateString()}
              </div>
              <p className="text-sm text-purple-700 font-medium mt-1">Last Activity</p>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default ActivityLog;
