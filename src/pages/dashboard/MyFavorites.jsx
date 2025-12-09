// My Favorites Page - LifeCherry Dashboard
import React, { useState, useMemo } from 'react';
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
  const { data, isLoading, refetch } = useQuery({
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
    } catch (error) {
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-cherry mb-2 flex items-center gap-3">
                <HiOutlineHeart className="w-10 h-10" />
                My Favorites
              </h1>
              <p className="text-gray-600">Your curated collection of life lessons</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineMagnifyingGlass className="text-text-muted w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search favorites by title, description, or creator..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Toggles */}
            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-cherry text-white'
                      : 'bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                  title="List View"
                >
                  <HiOutlineListBullet className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-cherry text-white'
                      : 'bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                  title="Grid View"
                >
                  <HiOutlineSquares2X2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  showFilters || hasActiveFilters
                    ? 'border-cherry bg-cherry-50 text-cherry'
                    : 'border-gray-200 text-text-secondary hover:border-gray-300'
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
                  className="inline-flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-text-secondary hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
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
                <label className="block text-sm font-semibold text-text mb-2">Emotional Tone</label>
                <select
                  value={filterEmotionalTone}
                  onChange={(e) => {
                    setFilterEmotionalTone(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
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
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          {favorites.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No favorites found</h3>
              <p className="text-text-muted mb-6">
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
                        className="bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 overflow-hidden group"
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
                            <div className="w-full h-full bg-gradient-to-br from-cherry-50 to-cherry-100 flex items-center justify-center">
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
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-cherry">
                              {fav.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-cherry transition-colors">
                            {fav.title}
                          </h3>
                          <p className="text-sm text-text-muted line-clamp-2 mb-3">
                            {fav.description}
                          </p>

                          {/* Creator & Tone */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <img 
                                src={fav.creatorPhoto} 
                                alt={fav.creatorName}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                              />
                              <span className="text-xs text-text-muted truncate max-w-[80px]">{fav.creatorName}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              fav.emotionalTone === 'Motivational' 
                                ? 'bg-green-50 text-green-600' 
                                : fav.emotionalTone === 'Sad'
                                  ? 'bg-blue-50 text-blue-600'
                                  : fav.emotionalTone === 'Realization'
                                    ? 'bg-purple-50 text-purple-600'
                                    : 'bg-amber-50 text-amber-600'
                            }`}>
                              {fav.emotionalTone}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/lessons/${fav._id}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              View
                            </Link>
                            <button
                              onClick={() => openRemoveModal(fav)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                              title="Remove from Favorites"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
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
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Lesson</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Category</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Emotional Tone</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Creator</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Added On</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {favorites.map((fav) => (
                      <tr key={fav._id} className="hover:bg-gray-50 transition-colors">
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
                                <div className="w-12 h-12 rounded-lg bg-cherry-50 flex items-center justify-center flex-shrink-0">
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
                                <h3 className="font-semibold text-text truncate max-w-[200px]">
                                  {fav.title}
                                </h3>
                                {fav.accessLevel === 'premium' && !userProfile?.isPremium && (
                                  <HiOutlineLockClosed className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-text-muted truncate max-w-[200px]">
                                {fav.description.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-cherry-50 text-cherry whitespace-nowrap">
                            {fav.category}
                          </span>
                        </td>

                        {/* Emotional Tone */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            fav.emotionalTone === 'Motivational' 
                              ? 'bg-green-50 text-green-600' 
                              : fav.emotionalTone === 'Sad'
                                ? 'bg-blue-50 text-blue-600'
                                : fav.emotionalTone === 'Realization'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-amber-50 text-amber-600'
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
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                            <span className="text-sm text-text">{fav.creatorName}</span>
                          </div>
                        </td>

                        {/* Added Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted whitespace-nowrap">
                            {formatDate(fav.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/lessons/${fav._id}`}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openRemoveModal(fav)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 cursor-pointer"
                              title="Remove from Favorites"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border">
                {favorites.map((fav) => (
                  <div key={fav._id} className="p-4">
                    <div className="flex gap-3 mb-4">
                      <div className="relative">
                        {fav.image ? (
                          <img 
                            src={fav.image} 
                            alt={fav.title}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-cherry-50 flex items-center justify-center flex-shrink-0">
                            <HiOutlineBookOpen className="w-8 h-8 text-cherry" />
                          </div>
                        )}
                        {fav.accessLevel === 'premium' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                            <HiOutlineStar className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text truncate">{fav.title}</h3>
                          {fav.accessLevel === 'premium' && !userProfile?.isPremium && (
                            <HiOutlineLockClosed className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-text-muted line-clamp-1">{fav.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cherry-50 text-cherry">
                            {fav.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            fav.emotionalTone === 'Motivational' 
                              ? 'bg-green-50 text-green-600' 
                              : fav.emotionalTone === 'Sad'
                                ? 'bg-blue-50 text-blue-600'
                                : fav.emotionalTone === 'Realization'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-amber-50 text-amber-600'
                          }`}>
                            {fav.emotionalTone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Creator & Date */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={fav.creatorPhoto} 
                          alt={fav.creatorName}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        />
                        <span className="text-sm text-text-muted">{fav.creatorName}</span>
                      </div>
                      <span className="text-xs text-text-muted">Added {formatDate(fav.createdAt)}</span>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lessons/${fav._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() => openRemoveModal(fav)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 cursor-pointer"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-text-muted">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} favorites
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                          currentPage === i + 1
                            ? 'bg-cherry text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiOutlineChevronRight className="w-5 h-5" />
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
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-text text-center mb-2">Remove from Favorites?</h3>
              <p className="text-text-muted text-center mb-6">
                Are you sure you want to remove "<strong>{selectedFavorite.title}</strong>" from your favorites?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedFavorite(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer disabled:opacity-50"
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
