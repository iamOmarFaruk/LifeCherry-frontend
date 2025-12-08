// User Activity Page - LifeCherry
import React, { useMemo } from 'react';
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

const ActivityLog = () => {
  useDocumentTitle('My Activity');
  const { authLoading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-activity'],
    enabled: !authLoading,
    queryFn: async () => {
      const res = await apiClient.get('/audit/user', { params: { limit: 100 } });
      return res.data;
    },
  });

  const changes = useMemo(() => data?.changes || [], [data]);

  return (
    <PageLoader>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="w-6 h-6 text-cherry" />
              My Activity
            </h1>
            <p className="text-text-secondary text-sm">See changes you made to lessons or your profile.</p>
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

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="py-2 px-4">When</th>
                  <th className="py-2 px-4">Action</th>
                  <th className="py-2 px-4">Target</th>
                  <th className="py-2 px-4">Summary</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-text-secondary" colSpan={4}>Loading...</td>
                  </tr>
                ) : changes.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 text-text-secondary" colSpan={4}>No activity yet</td>
                  </tr>
                ) : (
                  changes.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 px-4 whitespace-nowrap text-text-secondary">{formatDateTime(item.createdAt)}</td>
                      <td className="py-3 px-4 whitespace-nowrap capitalize">{item.action.replace('-', ' ')}</td>
                      <td className="py-3 px-4 whitespace-nowrap capitalize">{item.targetType}</td>
                      <td className="py-3 px-4 text-text-secondary">{item.summary || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default ActivityLog;
