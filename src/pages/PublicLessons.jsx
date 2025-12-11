// Public Lessons Page - LifeCherry
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiLock, FiHeart, FiBookmark, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { categories, emotionalTones } from '../data/lessons';
import apiClient from '../utils/apiClient';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';

const LESSONS_PER_PAGE = 9;

const PublicLessons = () => {
  useDocumentTitle('Public Lessons');
  const [searchParams, setSearchParams] = useSearchParams();
  const { firebaseUser, userProfile, authInitialized } = useAuth();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') || '';
  });
  const [selectedTone, setSelectedTone] = useState(() => {
    return searchParams.get('emotionalTone') || '';
  });
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('');
  const [sortBy, setSortBy] = useState(() => {
    const sortParam = searchParams.get('sort');
    return sortParam === 'mostSaved' ? 'mostSaved' : 'newest';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!firebaseUser;
  const isUserPremium = !!userProfile?.isPremium || userProfile?.role === 'admin';

  useEffect(() => {
    if (!authInitialized) return;

    let isMounted = true;
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/lessons', {
          params: {
            limit: 100,
            sort: sortBy === 'mostSaved' ? '-favoritesCount' : '-createdAt',
          },
        });
        if (!isMounted) return;
        setLessons(data?.lessons || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load lessons. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, [sortBy, authInitialized, firebaseUser]);

  useEffect(() => {
    const sortParam = searchParams.get('sort');
    const nextSort = sortParam === 'mostSaved' ? 'mostSaved' : 'newest';
    setSortBy((prev) => (prev === nextSort ? prev : nextSort));
  }, [searchParams]);

  // Get only public lessons
  const publicLessons = useMemo(
    () => lessons.filter(lesson => lesson.visibility === 'public'),
    [lessons]
  );

  // Respect access rules by auth status
  const visibleLessons = useMemo(() => {
    if (!isAuthenticated) {
      return publicLessons.filter(lesson => lesson.accessLevel === 'free');
    }
    if (isUserPremium) {
      return publicLessons;
    }
    // Logged in but free: show all public lessons, lock premium below
    return publicLessons;
  }, [isAuthenticated, isUserPremium, publicLessons]);

  // Filter, Search & Sort Logic
  const filteredLessons = useMemo(() => {
    let result = [...visibleLessons];

    // Search by title or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lesson =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(lesson => lesson.category === selectedCategory);
    }

    // Filter by emotional tone
    if (selectedTone) {
      result = result.filter(lesson => lesson.emotionalTone === selectedTone);
    }

    // Filter by access level
    if (selectedAccessLevel) {
      result = result.filter(lesson => lesson.accessLevel === selectedAccessLevel);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'mostSaved') {
      result.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0));
    }

    return result;
  }, [visibleLessons, searchQuery, selectedCategory, selectedTone, selectedAccessLevel, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / LESSONS_PER_PAGE);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * LESSONS_PER_PAGE,
    currentPage * LESSONS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);

    if (setter === setSortBy) {
      const params = new URLSearchParams(searchParams);
      if (value === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }
      setSearchParams(params);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTone('');
    setSelectedAccessLevel('');
    setSortBy('newest');
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.delete('sort');
    setSearchParams(params);
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || selectedCategory || selectedTone || selectedAccessLevel || sortBy !== 'newest';

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <PageLoader>
      <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 text-center">{error}</div>
        )}
        {/* Hero Header Section with Background Image */}
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=400&fit=crop&crop=center')`,
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/70 mb-2 md:mb-4">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <span>/</span>
              <span className="text-white">Public Lessons</span>
            </nav>
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-3">
              Public Lessons
            </h1>
            <p className="text-white/80 text-sm md:text-xl max-w-2xl">
              Discover wisdom shared by our community. Learn from real experiences.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
            {/* Search Input */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search lessons by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all text-text-cherry"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all cursor-pointer ${showFilters || hasActiveFilters
                  ? 'bg-cherry text-white border-cherry'
                  : 'bg-white text-text-secondary border-gray-200 hover:border-cherry'
                  }`}
              >
                <FiFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleFilterChange(setSelectedCategory)(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all text-text-cherry bg-white cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Emotional Tone Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Emotional Tone
                    </label>
                    <select
                      value={selectedTone}
                      onChange={(e) => handleFilterChange(setSelectedTone)(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all text-text-cherry bg-white cursor-pointer"
                    >
                      <option value="">All Tones</option>
                      {emotionalTones.map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>

                  {/* Access Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Access Level
                    </label>
                    <select
                      value={selectedAccessLevel}
                      onChange={(e) => handleFilterChange(setSelectedAccessLevel)(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all text-text-cherry bg-white cursor-pointer"
                    >
                      <option value="">All Levels</option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleFilterChange(setSortBy)(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all text-text-cherry bg-white cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="mostSaved">Most Saved</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${hasActiveFilters
                        ? 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <FiX className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-secondary">
              Showing <span className="font-semibold text-text-cherry">{filteredLessons.length}</span> lessons
              {hasActiveFilters && (
                <span className="text-text-muted"> (filtered)</span>
              )}
            </p>
          </div>

          {/* Lessons Grid */}
          {loading ? (
            <div className="text-center text-text-secondary py-16">Loading lessons...</div>
          ) : paginatedLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedLessons.map((lesson) => {
                const isPremiumLocked = lesson.accessLevel === 'premium' && !isUserPremium;

                return (
                  <div
                    key={lesson._id}
                    className={`relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${isPremiumLocked ? 'group' : ''
                      }`}
                  >
                    {/* Premium Locked Overlay */}
                    {isPremiumLocked && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 md:p-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mb-3 md:mb-4">
                          <FiLock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <h4 className="text-base md:text-lg font-semibold text-text-cherry mb-1 md:mb-2 text-center">
                          Premium Lesson
                        </h4>
                        <p className="text-text-secondary text-xs md:text-sm text-center mb-3 md:mb-4">
                          Upgrade to access exclusive content
                        </p>
                        <Link
                          to="/pricing"
                          className="px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm md:text-base font-medium rounded-full hover:shadow-lg transition-all"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    )}

                    {/* Lesson Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={lesson.image}
                        alt={lesson.title}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isPremiumLocked ? 'blur-sm' : ''
                          }`}
                      />
                      {/* Access Level Badge */}
                      <div className="absolute top-3 right-3">
                        {lesson.accessLevel === 'premium' ? (
                          <span className="badge-premium text-xs px-3 py-1">
                            ⭐ Premium
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                            Free
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <div className={`p-5 ${isPremiumLocked ? 'blur-sm' : ''}`}>
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                          {lesson.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
                          {lesson.emotionalTone}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base md:text-lg font-semibold text-text-cherry mb-2 line-clamp-2">
                        {lesson.title}
                      </h3>

                      {/* Description Preview */}
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {lesson.description}
                      </p>

                      {/* Creator Info & Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={lesson.creatorPhoto}
                            alt={lesson.creatorName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-text-cherry line-clamp-1">
                              {lesson.creatorName}
                            </p>
                            <p className="text-xs text-text-muted">
                              {formatDate(lesson.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-text-muted text-sm">
                          <span className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" />
                            {lesson.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiBookmark className="w-4 h-4" />
                            {lesson.favoritesCount}
                          </span>
                        </div>
                      </div>

                      {/* See Details Button */}
                      {!isPremiumLocked && (
                        <Link
                          to={`/lessons/${lesson._id}`}
                          className="mt-4 block w-full text-center py-3 bg-cherry-50 text-cherry font-medium rounded-xl hover:bg-cherry hover:!text-white transition-all cursor-pointer"
                        >
                          See Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-cherry mb-2">
                No lessons found
              </h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-cherry text-white font-medium rounded-xl hover:bg-cherry-dark transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-3 rounded-xl transition-all ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-text-secondary hover:bg-cherry hover:text-white shadow-sm cursor-pointer'
                  }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all cursor-pointer ${currentPage === pageNum
                          ? 'bg-cherry text-white'
                          : 'bg-white text-text-secondary hover:bg-cherry hover:text-white shadow-sm'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="px-2 text-text-muted">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-xl transition-all ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-text-secondary hover:bg-cherry hover:text-white shadow-sm cursor-pointer'
                  }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLoader>
  );
};

export default PublicLessons;
