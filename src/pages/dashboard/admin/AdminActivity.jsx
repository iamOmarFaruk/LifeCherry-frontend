// Admin Activity Page - LifeCherry
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineClipboardDocumentList, HiOutlineShieldCheck, HiOutlineUser, HiOutlineArrowPath } from 'react-icons/hi2';
import PageLoader from '../../../components/shared/PageLoader';
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
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <p className="text-sm text-text-secondary">Latest changes</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-border">
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
                <td className="py-4 text-text-secondary" colSpan={5}>Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-4 text-text-secondary" colSpan={5}>No activity yet</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 whitespace-nowrap text-text-secondary">{formatDateTime(item.createdAt)}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{item.actorEmail}</td>
                  <td className="py-3 pr-4 whitespace-nowrap capitalize">{item.action.replace('-', ' ')}</td>
                  <td className="py-3 pr-4 whitespace-nowrap capitalize">{item.targetType}</td>
                  <td className="py-3 pr-4 text-text-secondary">{item.summary || '-'}</td>
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

  const { data, isLoading, error, refetch } = useQuery({
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="w-6 h-6 text-cherry" />
              Change History
            </h1>
            <p className="text-text-secondary text-sm">Track admin actions and user updates across the platform.</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ActivityTable
            title="Admin Changes"
            icon={HiOutlineShieldCheck}
            colorClass="bg-purple-50 text-purple-600"
            items={adminChanges}
            isLoading={isLoading}
          />
          <ActivityTable
            title="User Changes"
            icon={HiOutlineUser}
            colorClass="bg-blue-50 text-blue-600"
            items={userChanges}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageLoader>
  );
};

export default AdminActivity;
