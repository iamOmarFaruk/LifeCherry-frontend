// My Favorites Page - LifeCherry Dashboard
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineBookmark,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineLockClosed,
  HiOutlineListBullet,
  HiOutlineSquares2X2
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import { categories, emotionalTones } from '../../data/lessons';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import Tooltip from '../../components/shared/Tooltip';

const MyFavorites = () => {
  useDocumentTitle('My Favorites');
  const { firebaseUser, userProfile } = useAuth();
  const userEmail = firebaseUser?.email?.toLowerCase();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEmotionalTone, setFilterEmotionalTone] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 8;

  // Fetch favorites
  const { data, refetch } = useQuery({
    queryKey: ['my-favorites', userEmail, currentPage, searchQuery, filterCategory, filterEmotionalTone],
    enabled: !!userEmail,
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        favoritedBy: userEmail,
        search: searchQuery,
        category: filterCategory,
        emotionalTone: filterEmotionalTone
      };
      const res = await apiClient.get('/lessons', { params });
      return res.data;
    },
  });

  const favorites = data?.lessons || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('favoritesViewMode');
    return saved || 'list'; // Default to list view
  });

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('favoritesViewMode', mode);
  };

  // Modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date - compact single line format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Open remove confirmation modal
  const openRemoveModal = (favorite) => {
    setSelectedFavorite(favorite);
    setShowRemoveModal(true);
  };

  // Handle remove from favorites
  const handleRemoveFavorite = async () => {
    if (!selectedFavorite) return;
    setIsSubmitting(true);

    try {
      await apiClient.post(`/lessons/${selectedFavorite._id}/favorite`);
      await refetch();
      toast.success('Removed from favorites');
      setShowRemoveModal(false);
      setSelectedFavorite(null);
    } catch {
      toast.error('Failed to remove favorite');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterEmotionalTone('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterCategory || filterEmotionalTone;

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Page Header */}
        <DashboardPageHeader
          icon={HiOutlineHeart}
          title="My Favorites"
          description="Your curated collection of life lessons"
        />

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineMagnifyingGlass className="text-text-muted dark:text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search favorites by title, description, or creator..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white dark:bg-gray-900 text-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Filter Toggles */}
            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <Tooltip content="List View">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-3 transition-all duration-200 cursor-pointer ${viewMode === 'list'
                      ? 'bg-cherry text-white'
                      : 'bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <HiOutlineListBullet className="w-5 h-5" />
                  </button>
                </Tooltip>
                <Tooltip content="Grid View">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-3 transition-all duration-200 cursor-pointer ${viewMode === 'grid'
                      ? 'bg-cherry text-white'
                      : 'bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <HiOutlineSquares2X2 className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${showFilters || hasActiveFilters
                  ? 'border-cherry bg-cherry-50 dark:bg-cherry-900/20 text-cherry dark:text-cherry-400'
                  : 'border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <HiOutlineFunnel className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-cherry rounded-full"></span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-text-secondary dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white dark:bg-gray-900 text-text dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Emotional Tone</label>
                <select
                  value={filterEmotionalTone}
                  onChange={(e) => {
                    setFilterEmotionalTone(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white dark:bg-gray-900 text-text dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">All Tones</option>
                  {emotionalTones.map(tone => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Favorites Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border dark:border-gray-700 overflow-hidden">
          {favorites.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineBookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text dark:text-white mb-2">No favorites found</h3>
              <p className="text-text-muted dark:text-gray-400 mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search query'
                  : "You haven't saved any lessons yet"
                }
              </p>
              {!hasActiveFilters && (
                <Link
                  to="/public-lessons"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 cursor-pointer"
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                  Explore Public Lessons
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favorites.map((fav) => (
                      <div
                        key={fav._id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          {fav.image ? (
                            <img
                              src={fav.image}
                              alt={fav.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cherry-50 to-cherry-100 dark:from-cherry-900/20 dark:to-cherry-900/40 flex items-center justify-center">
                              <HiOutlineBookOpen className="w-12 h-12 text-cherry" />
                            </div>
                          )}
                          {/* Premium Badge */}
                          {fav.accessLevel === 'premium' && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-amber-400 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <HiOutlineStar className="w-3 h-3" />
                              Premium
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-cherry">
                              {fav.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-text dark:text-white mb-1 line-clamp-1 group-hover:text-cherry transition-colors">
                            {fav.title}
                          </h3>
                          <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2 mb-3">
                            {fav.description}
                          </p>

                          {/* Creator & Tone */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={fav.creatorPhoto}
                                alt={fav.creatorName}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                              />
                              <span className="text-xs text-text-muted dark:text-gray-400 truncate max-w-[80px]">{fav.creatorName}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${fav.emotionalTone === 'Motivational'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : fav.emotionalTone === 'Sad'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : fav.emotionalTone === 'Realization'
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              }`}>
                              {fav.emotionalTone}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/lessons/${fav._id}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer text-sm"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              View
                            </Link>
                            <Tooltip content="Remove from Favorites">
                              <button
                                onClick={() => openRemoveModal(fav)}
                                className="p-2 bg-cherry text-white rounded-lg hover:bg-cherry-dark transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List View - Desktop Table */}
              {viewMode === 'list' && (
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-border dark:border-gray-700">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Lesson</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Category</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Emotional Tone</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Creator</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Added On</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-text dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-gray-700">
                      {favorites.map((fav) => (
                        <tr key={fav._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          {/* Lesson Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {fav.image ? (
                                  <img
                                    src={fav.image}
                                    alt={fav.title}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-cherry-50 dark:bg-cherry-900/20 flex items-center justify-center flex-shrink-0">
                                    <HiOutlineBookOpen className="w-6 h-6 text-cherry" />
                                  </div>
                                )}
                                {fav.accessLevel === 'premium' && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                                    <HiOutlineStar className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-text dark:text-white truncate max-w-[200px]">
                                    {fav.title}
                                  </h3>
                                  {fav.accessLevel === 'premium' && (!userProfile?.isPremium && userProfile?.role !== 'admin') && (
                                    <HiOutlineLockClosed className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-text-muted dark:text-gray-400 truncate max-w-[200px]">
                                  {fav.description.substring(0, 60)}...
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-cherry-50 dark:bg-cherry-900/20 text-cherry dark:text-cherry-400 whitespace-nowrap">
                              {fav.category}
                            </span>
                          </td>

                          {/* Emotional Tone */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${fav.emotionalTone === 'Motivational'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : fav.emotionalTone === 'Sad'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : fav.emotionalTone === 'Realization'
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              }`}>
                              {fav.emotionalTone}
                            </span>
                          </td>

                          {/* Creator */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={fav.creatorPhoto}
                                alt={fav.creatorName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                              />
                              <span className="text-sm text-text dark:text-gray-300">{fav.creatorName}</span>
                            </div>
                          </td>

                          {/* Added Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-text-muted dark:text-gray-400 whitespace-nowrap">
                              {formatDate(fav.createdAt)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip content="View Details">
                                <Link
                                  to={`/lessons/${fav._id}`}
                                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                >
                                  <HiOutlineEye className="w-4 h-4" />
                                </Link>
                              </Tooltip>
                              <Tooltip content="Remove from Favorites">
                                <button
                                  onClick={() => openRemoveModal(fav)}
                                  className="p-2 rounded-lg bg-cherry text-white hover:bg-cherry-dark transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                >
                                  <HiOutlineTrash className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border dark:divide-gray-700">
                {favorites.map((fav) => (
                  <div key={fav._id} className="p-4 bg-white dark:bg-gray-800 rounded-xl mb-4 border border-border dark:border-gray-700 shadow-sm">
                    <div className="flex gap-3 mb-4">
                      <div className="relative">
                        {fav.image ? (
                          <img
                            src={fav.image}
                            alt={fav.title}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-cherry-50 dark:bg-cherry-900/20 flex items-center justify-center flex-shrink-0">
                            <HiOutlineBookOpen className="w-8 h-8 text-cherry" />
                          </div>
                        )}
                        {fav.accessLevel === 'premium' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                            <HiOutlineStar className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text dark:text-white truncate text-sm sm:text-base">{fav.title}</h3>
                          {fav.accessLevel === 'premium' && (!userProfile?.isPremium && userProfile?.role !== 'admin') && (
                            <HiOutlineLockClosed className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted dark:text-gray-400 line-clamp-2 mt-0.5">{fav.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cherry-50 dark:bg-cherry-900/20 text-cherry dark:text-cherry-400">
                            {fav.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${fav.emotionalTone === 'Motivational'
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : fav.emotionalTone === 'Sad'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : fav.emotionalTone === 'Realization'
                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            }`}>
                            {fav.emotionalTone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Creator & Date */}
                    <div className="flex items-center justify-between gap-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={fav.creatorPhoto}
                          alt={fav.creatorName}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <span className="text-xs text-text-muted dark:text-gray-400 truncate max-w-[100px]">{fav.creatorName}</span>
                      </div>
                      <span className="text-xs text-text-muted dark:text-gray-400">Added {formatDate(fav.createdAt)}</span>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lessons/${fav._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                      <Tooltip content="Remove">
                        <button
                          onClick={() => openRemoveModal(fav)}
                          className="p-2 bg-cherry text-white rounded-lg hover:bg-cherry-dark transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 md:px-6 border-t border-border dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-text-muted dark:text-gray-400 text-center sm:text-left">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} favorites
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text dark:text-gray-300"
                    >
                      <HiOutlineChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${currentPage === i + 1
                          ? 'bg-cherry text-white'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-text dark:text-gray-300'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text dark:text-gray-300"
                    >
                      <HiOutlineChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Remove Confirmation Modal */}
        {showRemoveModal && selectedFavorite && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-text dark:text-white text-center mb-2">Remove from Favorites?</h3>
              <p className="text-text-muted dark:text-gray-400 text-center mb-6">
                Are you sure you want to remove "<strong>{selectedFavorite.title}</strong>" from your favorites?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedFavorite(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveFavorite}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Removing...
                    </>
                  ) : (
                    <>
                      <HiOutlineTrash className="w-5 h-5" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default MyFavorites;
