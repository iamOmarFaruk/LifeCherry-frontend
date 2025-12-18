// Manage Lessons Page - LifeCherry Admin
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBookOpen,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineFlag,
  HiOutlineHeart,
  HiOutlineBookmark,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useAuth from '../../../hooks/useAuth';
import apiClient from '../../../utils/apiClient';
import { categories } from '../../../data/lessons';
import Tooltip from '../../../components/shared/Tooltip';

const ManageLessons = () => {
  useDocumentTitle('Manage Lessons');
  const { authLoading } = useAuth();

  // State
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [filterAccessLevel, setFilterAccessLevel] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    featured: 0,
    flagged: 0
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;

    // Debounce search
    const timer = setTimeout(() => {
      fetchLessons();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterVisibility, filterAccessLevel, filterFeatured, sortBy, currentPage, authLoading]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/lessons/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getSortParam = (sortOption) => {
    switch (sortOption) {
      case 'newest': return '-createdAt';
      case 'oldest': return 'createdAt';
      case 'title': return 'title';
      case 'likes': return '-likesCount';
      case 'reports': return '-reportCount';
      default: return '-createdAt';
    }
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: getSortParam(sortBy),
        search: searchQuery,
        category: filterCategory,
        visibility: filterVisibility || 'all',
        accessLevel: filterAccessLevel,
      };

      if (filterFeatured === 'featured') params.isFeatured = true;
      if (filterFeatured === 'not-featured') params.isFeatured = false;

      const res = await apiClient.get('/lessons', { params });
      setLessonsData(res.data.lessons);
      setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
      setTotalItems(res.data.total);
    } catch (error) {
      console.error('Fetch lessons error:', error);
      toast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle toggle featured
  const handleToggleFeatured = (lesson) => {
    setSelectedLesson(lesson);
    setShowFeatureModal(true);
  };

  // Confirm toggle featured
  const confirmToggleFeatured = async () => {
    if (!selectedLesson) return;
    setIsSubmitting(true);
    try {
      const newStatus = !selectedLesson.isFeatured;
      await apiClient.patch(`/lessons/${selectedLesson._id}`, { isFeatured: newStatus });

      // Optimistic update
      setLessonsData(prev => prev.map(l =>
        l._id === selectedLesson._id ? { ...l, isFeatured: newStatus } : l
      ));

      toast.success(newStatus ? 'Added to featured!' : 'Removed from featured');
      setShowFeatureModal(false);
      setSelectedLesson(null);
      fetchStats();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle mark as reviewed
  const handleMarkReviewed = async (lesson) => {
    try {
      await apiClient.patch(`/lessons/${lesson._id}`, { isReviewed: true });
      setLessonsData(prev => prev.map(l =>
        l._id === lesson._id ? { ...l, isReviewed: true } : l
      ));
      toast.success('Marked as reviewed');
    } catch (error) {
      toast.error('Failed to mark as reviewed');
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/lessons/${selectedLesson._id}`);

      toast.success('Lesson deleted successfully');
      setShowDeleteModal(false);
      setSelectedLesson(null);

      // If deleting the last item on page, go back one page if possible
      if (lessonsData.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchLessons();
      }
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sync report counts
  const handleSyncData = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/lessons/sync-counts');
      toast.success(res.data.message || 'System data synchronized');
      fetchStats();
      fetchLessons();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterVisibility('');
    setFilterAccessLevel('');
    setFilterFeatured('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterCategory || filterVisibility || filterAccessLevel || filterFeatured || sortBy !== 'newest';

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DashboardPageHeader
            icon={HiOutlineBookOpen}
            title="Manage Lessons"
            description="View and manage all lessons on the platform"
          />
          <button
            onClick={handleSyncData}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <HiOutlineArrowPath className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            {isSubmitting ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cherry-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.total}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <HiOutlineGlobeAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.public}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Public</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <HiOutlineLockClosed className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.private}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Private</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.featured}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Featured</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{stats.flagged}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Flagged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${showFilters ? 'border-cherry bg-cherry-50 text-cherry' : 'border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:border-cherry'
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
            <div className="mt-4 pt-4 border-t border-border dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text dark:text-white mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text dark:text-white mb-1">Visibility</label>
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text dark:text-white mb-1">Access Level</label>
                <select
                  value={filterAccessLevel}
                  onChange={(e) => setFilterAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text dark:text-white mb-1">Featured</label>
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="featured">Featured Only</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text dark:text-white mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="likes">Most Likes</option>
                  <option value="reports">Most Reports</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Lessons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-border dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-cherry" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-text-secondary dark:text-gray-400 font-medium">Loading lessons...</span>
                      </div>
                    </td>
                  </tr>
                ) : lessonsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <HiOutlineBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-text dark:text-white mb-2">No lessons found</h3>
                      <p className="text-text-secondary dark:text-gray-400">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  lessonsData.map((lesson) => (
                    <tr key={lesson._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={lesson.image}
                            alt={lesson.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="max-w-xs">
                            <h4 className="font-medium text-text dark:text-white truncate">{lesson.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {lesson.category && (
                                <span className="text-xs bg-cherry-50 dark:bg-red-900/30 text-cherry dark:text-red-300 px-2 py-0.5 rounded-full">
                                  {lesson.category}
                                </span>
                              )}
                              {lesson.isFeatured && (
                                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <HiOutlineSparkles className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={lesson.creatorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(lesson.creatorName)}&background=random`}
                            alt={lesson.creatorName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-text dark:text-white">{lesson.creatorName}</p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">{lesson.creatorEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            {lesson.visibility === 'public' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <HiOutlineGlobeAlt className="w-3 h-3" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                <HiOutlineLockClosed className="w-3 h-3" />
                                Private
                              </span>
                            )}
                            {lesson.accessLevel === 'premium' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                <HiOutlineStar className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                          </div>
                          {lesson.reportCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full w-fit">
                              <HiOutlineFlag className="w-3 h-3" />
                              {lesson.reportCount} {lesson.reportCount === 1 ? 'Report' : 'Reports'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-text-secondary dark:text-gray-400">
                            <HiOutlineHeart className="w-4 h-4 text-red-400" />
                            {lesson.likesCount}
                          </span>
                          <span className="flex items-center gap-1 text-text-secondary dark:text-gray-400">
                            <HiOutlineBookmark className="w-4 h-4 text-blue-400" />
                            {lesson.favoritesCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary dark:text-gray-400">
                          {formatDate(lesson.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="View Lesson">
                            <Link
                              to={`/lessons/${lesson._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <HiOutlineEye className="w-5 h-5" />
                            </Link>
                          </Tooltip>
                          <Tooltip content={lesson.isFeatured ? 'Remove from Featured' : 'Add to Featured'}>
                            <button
                              onClick={() => handleToggleFeatured(lesson)}
                              className={`p-2 rounded-lg transition-colors ${lesson.isFeatured
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-600'
                                }`}
                            >
                              <HiOutlineSparkles className="w-5 h-5" />
                            </button>
                          </Tooltip>
                          {!lesson.isReviewed && (
                            <Tooltip content="Mark as Reviewed">
                              <button
                                onClick={() => handleMarkReviewed(lesson)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              >
                                <HiOutlineCheckCircle className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip content="Delete Lesson">
                            <button
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} lessons
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Toggle Modal */}
        {showFeatureModal && selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedLesson.isFeatured ? 'bg-gray-100 dark:bg-gray-700' : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                  <HiOutlineSparkles className={`w-6 h-6 ${selectedLesson.isFeatured ? 'text-gray-600 dark:text-gray-300' : 'text-amber-600 dark:text-amber-400'
                    }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-white">
                    {selectedLesson.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Confirm this action</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedLesson.image}
                    alt={selectedLesson.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text dark:text-white line-clamp-1">{selectedLesson.title}</h4>
                    <p className="text-sm text-text-secondary dark:text-gray-400">by {selectedLesson.creatorName}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                {selectedLesson.isFeatured
                  ? 'This lesson will be removed from the featured section.'
                  : 'This lesson will be added to the featured section and highlighted on the homepage.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeatureModal(false);
                    setSelectedLesson(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleFeatured}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${selectedLesson.isFeatured
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-white">Delete Lesson</h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedLesson.image}
                    alt={selectedLesson.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text dark:text-white line-clamp-1">{selectedLesson.title}</h4>
                    <p className="text-sm text-text-secondary dark:text-gray-400">by {selectedLesson.creatorName}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this lesson? This will move it to trash.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLesson(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLesson}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Lesson'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default ManageLessons;
