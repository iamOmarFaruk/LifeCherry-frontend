// User Activity Log Page - LifeCherry
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineSparkles,
  HiOutlineLockClosed
} from 'react-icons/hi2';
import PageLoader from '../../components/shared/PageLoader';
import Loading from '../../components/shared/Loading';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import apiClient from '../../utils/apiClient';
import useAuth from '../../hooks/useAuth';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';

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
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-l-4 border-green-500',
      badge: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    },
    'update': {
      icon: HiOutlinePencilSquare,
      label: 'Updated',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-l-4 border-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
    },
    'delete': {
      icon: HiOutlineTrash,
      label: 'Deleted',
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-l-4 border-red-500',
      badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
    },
    'view': {
      icon: HiOutlineEye,
      label: 'Viewed',
      bg: 'bg-gray-50 dark:bg-gray-700',
      border: 'border-l-4 border-gray-500',
      badge: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
    },
    'report': {
      icon: HiOutlineFlag,
      label: 'Reported',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-l-4 border-amber-500',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
    },
  };
  return details[action] || details.update;
};

const getTargetDetails = (targetType) => {
  const details = {
    'lesson': { icon: HiOutlineClipboardDocumentList, label: 'Lesson', color: 'text-cherry' },
    'profile': { icon: HiOutlineUser, label: 'Profile', color: 'text-blue-600' },
    'user': { icon: HiOutlineUser, label: 'Profile', color: 'text-blue-600' },
  };
  return details[targetType] || { icon: HiOutlineClipboardDocumentList, label: targetType, color: 'text-gray-600' };
};

// Dummy data for the blurred section
const dummyActivities = [
  { id: 'd1', action: 'view', targetType: 'lesson', summary: 'Viewed lesson "The Art of Letting Go"', createdAt: new Date().toISOString() },
  { id: 'd2', action: 'update', targetType: 'profile', summary: 'Updated profile information', createdAt: new Date().toISOString() },
  { id: 'd3', action: 'create', targetType: 'lesson', summary: 'Created new lesson draft', createdAt: new Date().toISOString() },
  { id: 'd4', action: 'view', targetType: 'lesson', summary: 'Viewed lesson "Mindfulness Basics"', createdAt: new Date().toISOString() },
  { id: 'd5', action: 'delete', targetType: 'comment', summary: 'Deleted a comment', createdAt: new Date().toISOString() },
  { id: 'd6', action: 'view', targetType: 'lesson', summary: 'Viewed lesson "Daily Habits"', createdAt: new Date().toISOString() },
];

const ActivityLog = () => {
  useDocumentTitle('Activity Log');
  const { authLoading, profileLoading, userProfile } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const loadMoreRef = useRef();

  const isPremium = userProfile?.isPremium || userProfile?.role === 'admin';

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ['user-activity', filterType, isPremium],
    enabled: !authLoading && !profileLoading,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get('/audit/user', {
        params: {
          page: pageParam,
          limit: isPremium ? 20 : 6,
          targetType: filterType === 'all' ? undefined : filterType
        }
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      // Always allow pagination if user is admin or premium
      // The backend also returns isPremium=true for admins now
      const isUserPremium = lastPage.isPremium || userProfile?.role === 'admin';
      if (!isUserPremium) return undefined;
      if (lastPage.page * lastPage.limit >= lastPage.total) return undefined;
      return lastPage.page + 1;
    },
  });

  const allChanges = data?.pages.flatMap(page => page.changes) || [];
  const totalCount = data?.pages[0]?.total || 0;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Calculate stats
  const stats = useMemo(() => {
    // Use allChanges for stats, but note that for free users this is incomplete
    const source = allChanges;
    return {
      total: totalCount || source.length,
      created: source.filter(c => c.action === 'create').length,
      updated: source.filter(c => c.action === 'update').length,
      deleted: source.filter(c => c.action === 'delete').length,
      reported: source.filter(c => c.action === 'report').length,
    };
  }, [allChanges, totalCount]);

  // Filter displayed changes based on selected tab
  const displayedChanges = useMemo(() => {
    if (filterType === 'all') return allChanges;
    return allChanges.filter(change => change.targetType === filterType);
  }, [allChanges, filterType]);

  if (authLoading || profileLoading) {
    return <Loading />;
  }

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <DashboardPageHeader
          icon={HiOutlineClipboardDocumentList}
          title="Activity Log"
          description="View all actions and changes across your account"
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap p-2 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { value: 'all', label: 'All Activity' },
            { value: 'lesson', label: 'Lessons' },
            { value: 'user', label: 'Profile' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${filterType === filter.value
                ? 'bg-cherry text-white shadow-lg'
                : 'bg-white dark:bg-gray-700 text-text-secondary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
          {/* Total - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HiOutlineClipboardDocumentList className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.total}</p>
                <p className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">Total Actions</p>
              </div>
            </div>
          </div>

          {/* Created */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <HiOutlineCheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-text dark:text-white">{stats.created}</p>
                <p className="text-[10px] lg:text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider truncate">Created</p>
              </div>
            </div>
          </div>

          {/* Updated */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <HiOutlinePencilSquare className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-text dark:text-white">{stats.updated}</p>
                <p className="text-[10px] lg:text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider truncate">Updated</p>
              </div>
            </div>
          </div>

          {/* Reported */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <HiOutlineFlag className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-text dark:text-white">{stats.reported}</p>
                <p className="text-[10px] lg:text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider truncate">Reported</p>
              </div>
            </div>
          </div>

          {/* Deleted */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <HiOutlineTrash className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-text dark:text-white">{stats.deleted}</p>
                <p className="text-[10px] lg:text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider truncate">Deleted</p>
              </div>
            </div>
          </div>
        </div>

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
          ) : displayedChanges.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineClipboardDocumentList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-text dark:text-white mb-1">No activity found</h3>
              <p className="text-text-secondary dark:text-gray-400">Your recent actions will appear here</p>
            </div>
          ) : (
            <>
              {displayedChanges.map((change) => {
                const actionDetails = getActionDetails(change.action);
                const targetDetails = getTargetDetails(change.targetType);
                const ActionIcon = actionDetails.icon;
                const TargetIcon = targetDetails.icon;

                return (
                  <div
                    key={change.id}
                    className={`bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl border border-border dark:border-gray-700 hover:shadow-md transition-all duration-200 group ${actionDetails.border}`}
                  >
                    <div className="flex items-start gap-3 lg:gap-4">
                      {/* Icon */}
                      <div className={`p-2 lg:p-3 rounded-xl ${actionDetails.bg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        <ActionIcon className={`w-5 h-5 lg:w-6 lg:h-6 ${actionDetails.badge.split(' ')[1]}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-4 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-wide ${actionDetails.badge}`}>
                              {actionDetails.label}
                            </span>
                            <span className="text-xs lg:text-sm font-medium text-text-secondary flex items-center gap-1">
                              <TargetIcon className={`w-3.5 h-3.5 ${targetDetails.color}`} />
                              {targetDetails.label}
                            </span>
                          </div>
                          <span className="text-[10px] lg:text-xs font-medium text-text-muted whitespace-nowrap ml-auto">
                            {formatDateTime(change.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm lg:text-base text-text dark:text-white font-medium leading-relaxed">
                          {change.summary}
                        </p>

                        {/* Metadata/Details */}
                        {change.metadata && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 text-xs lg:text-sm text-text-secondary dark:text-gray-300 overflow-hidden">
                            {change.metadata.detailedChanges && Array.isArray(change.metadata.detailedChanges) ? (
                              <div className="space-y-1">
                                {change.metadata.detailedChanges.map((detail, idx) => (
                                  <div key={idx} className="flex flex-wrap items-center gap-1">
                                    <span className="font-medium text-text-muted capitalize">
                                      Update {detail.field.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    {detail.from !== undefined && detail.to !== undefined ? (
                                      <>
                                        <span className="text-gray-400 dark:text-gray-500">- from</span>
                                        <span className="font-medium text-text dark:text-white bg-white dark:bg-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-500 max-w-[100px] sm:max-w-[150px] truncate" title={String(detail.from)}>
                                          {String(detail.from)}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500">to</span>
                                        <span className="font-medium text-text dark:text-white bg-white dark:bg-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-500 max-w-[100px] sm:max-w-[150px] truncate" title={String(detail.to)}>
                                          {String(detail.to)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-gray-500">changed</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : Object.keys(change.metadata).length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {Object.entries(change.metadata).map(([key, value]) => {
                                  if (key === 'fields' || key === 'detailedChanges') return null;
                                  return (
                                    <div key={key} className="flex items-center gap-2 max-w-full">
                                      <span className="font-medium text-text-muted capitalize flex-shrink-0">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                      <span className="truncate">{String(value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Free User Blur Overlay */}
              {!isPremium && (
                <div className="relative mt-4">
                  {/* Dummy Blurred Items */}
                  <div className="space-y-3 opacity-50 blur-[2px] select-none pointer-events-none">
                    {dummyActivities.map((dummy) => {
                      const actionDetails = getActionDetails(dummy.action);
                      const targetDetails = getTargetDetails(dummy.targetType);
                      const ActionIcon = actionDetails.icon;
                      const TargetIcon = targetDetails.icon;

                      return (
                        <div
                          key={dummy.id}
                          className={`bg-white p-4 rounded-xl border border-border ${actionDetails.border}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${actionDetails.bg}`}>
                              <ActionIcon className={`w-6 h-6 ${actionDetails.badge.split(' ')[1]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${actionDetails.badge}`}>
                                    {actionDetails.label}
                                  </span>
                                  <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
                                    <TargetIcon className={`w-4 h-4 ${targetDetails.color}`} />
                                    {targetDetails.label}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                                  {formatDateTime(dummy.createdAt)}
                                </span>
                              </div>
                              <p className="text-text font-medium leading-relaxed">{dummy.summary}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Upgrade CTA Overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-white/60 to-white/95 backdrop-blur-[1px] rounded-xl border border-white/50">
                    <div className="p-8 text-center max-w-md mx-auto animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100/50">
                        <HiOutlineLockClosed className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Unlock Full Activity History
                      </h3>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        Upgrade to Premium to access your complete activity history, detailed insights, and unlimited logs.
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cherry to-cherry-dark text-white font-bold rounded-xl shadow-xl shadow-cherry/20 hover:shadow-2xl hover:shadow-cherry/30 hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <HiOutlineSparkles className="w-5 h-5 group-hover:animate-spin-slow" />
                        Upgrade to Premium
                      </Link>
                      <p className="mt-4 text-xs text-gray-400 font-medium">
                        Join thousands of premium members today
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Infinite Scroll Loader */}
              {isPremium && hasNextPage && (
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                      <svg className="animate-spin h-5 w-5 text-cherry" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium text-text-secondary">Loading more history...</span>
                    </div>
                  ) : error ? (
                    <button
                      onClick={() => fetchNextPage()}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Failed to load more. Tap to retry.
                    </button>
                  ) : (
                    <div className="h-8" /> /* Spacer for observer */
                  )}
                </div>
              )}

              {/* End of History Message */}
              {isPremium && !hasNextPage && displayedChanges.length > 0 && (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-text-muted">
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    No more activity to display
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageLoader>
  );
};

export default ActivityLog;
