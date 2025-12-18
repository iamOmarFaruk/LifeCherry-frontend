// Admin Activity Page - LifeCherry
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineClipboardDocumentList, HiOutlineShieldCheck, HiOutlineUser, HiOutlineArrowPath } from 'react-icons/hi2';
import PageLoader from '../../../components/shared/PageLoader';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient from '../../../utils/apiClient';
import useAuth from '../../../hooks/useAuth';

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ActivityTable = ({ title, icon, colorClass, items, isLoading }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text dark:text-white">{title}</h2>
          <p className="text-sm text-text-secondary dark:text-gray-400">Latest changes</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted dark:text-gray-400 border-b border-border dark:border-gray-700">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Target</th>
              <th className="py-2 pr-4">Summary</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-4 text-text-secondary dark:text-gray-400" colSpan={5}>Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-4 text-text-secondary dark:text-gray-400" colSpan={5}>No activity yet</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 dark:border-gray-700/60 last:border-0">
                  <td className="py-3 pr-4 whitespace-nowrap text-text-secondary dark:text-gray-400">{formatDateTime(item.createdAt)}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-text dark:text-gray-300">{item.actorEmail}</td>
                  <td className="py-3 pr-4 whitespace-nowrap capitalize text-text dark:text-gray-300">{item.action.replace('-', ' ')}</td>
                  <td className="py-3 pr-4 whitespace-nowrap capitalize text-text dark:text-gray-300">{item.targetType}</td>
                  <td className="py-3 pr-4 text-text-secondary dark:text-gray-400">{item.summary || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminActivity = () => {
  useDocumentTitle('Activity - Admin');
  const { authLoading } = useAuth();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['admin-activity'],
    enabled: !authLoading,
    queryFn: async () => {
      const res = await apiClient.get('/audit/admin', { params: { limit: 100 } });
      return res.data;
    },
  });

  const changes = useMemo(() => data?.changes || [], [data]);
  const adminChanges = useMemo(() => changes.filter((c) => c.actorRole === 'admin'), [changes]);
  const userChanges = useMemo(() => changes.filter((c) => c.actorRole !== 'admin'), [changes]);

  return (
    <PageLoader>
      <div className="space-y-6">
        <DashboardPageHeader
          icon={HiOutlineClipboardDocumentList}
          title="Change History"
          description="Track admin actions and user updates across the platform."
        >
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border dark:border-gray-700 text-sm text-text dark:text-gray-300 hover:border-cherry hover:text-cherry dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineArrowPath className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </DashboardPageHeader>

        {error && (
          <div className="p-3 rounded-xl bg-cherry-50 text-cherry-700 border border-cherry-100 text-sm">{error.message || 'Failed to load activity'}</div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ActivityTable
            title="Admin Changes"
            icon={HiOutlineShieldCheck}
            colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            items={adminChanges}
            isLoading={isLoading}
          />
          <ActivityTable
            title="User Changes"
            icon={HiOutlineUser}
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            items={userChanges}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageLoader>
  );
};

export default AdminActivity;
