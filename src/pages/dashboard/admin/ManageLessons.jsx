// Manage Lessons Page - LifeCherry Admin
import React, { useState, useMemo } from 'react';
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
  HiOutlineBookmark
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { lessons, categories } from '../../../data/lessons';
import { reports } from '../../../data/reports';

const ManageLessons = () => {
  useDocumentTitle('Manage Lessons');
  
  // State
  const [lessonsData, setLessonsData] = useState(lessons);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [filterAccessLevel, setFilterAccessLevel] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Get report count for lesson
  const getReportCount = (lessonId) => {
    return reports.filter(r => r.lessonId === lessonId).length;
  };

  // Filter and search
  const filteredLessons = useMemo(() => {
    let result = lessonsData.map(lesson => ({
      ...lesson,
      reportCount: getReportCount(lesson._id)
    }));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lesson =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.creatorName.toLowerCase().includes(query) ||
          lesson.creatorEmail.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      result = result.filter(lesson => lesson.category === filterCategory);
    }

    if (filterVisibility) {
      result = result.filter(lesson => lesson.visibility === filterVisibility);
    }

    if (filterAccessLevel) {
      result = result.filter(lesson => lesson.accessLevel === filterAccessLevel);
    }

    if (filterFeatured) {
      result = result.filter(lesson => 
        filterFeatured === 'featured' ? lesson.isFeatured : !lesson.isFeatured
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'likes':
        result.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'reports':
        result.sort((a, b) => b.reportCount - a.reportCount);
        break;
      default:
        break;
    }

    return result;
  }, [lessonsData, searchQuery, filterCategory, filterVisibility, filterAccessLevel, filterFeatured, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
  const confirmToggleFeatured = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLessonsData(prev => prev.map(l => 
        l._id === selectedLesson._id ? { ...l, isFeatured: !l.isFeatured } : l
      ));
      toast.success(selectedLesson.isFeatured ? 'Removed from featured' : 'Added to featured!');
      setShowFeatureModal(false);
      setSelectedLesson(null);
      setIsSubmitting(false);
    }, 800);
  };

  // Handle mark as reviewed
  const handleMarkReviewed = (lesson) => {
    setLessonsData(prev => prev.map(l => 
      l._id === lesson._id ? { ...l, isReviewed: true } : l
    ));
    toast.success('Marked as reviewed');
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLessonsData(prev => prev.filter(l => l._id !== selectedLesson._id));
      toast.success('Lesson deleted successfully');
      setShowDeleteModal(false);
      setSelectedLesson(null);
      setIsSubmitting(false);
    }, 1000);
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

  // Stats
  const stats = {
    total: lessonsData.length,
    public: lessonsData.filter(l => l.visibility === 'public').length,
    private: lessonsData.filter(l => l.visibility === 'private').length,
    featured: lessonsData.filter(l => l.isFeatured).length,
    flagged: lessonsData.filter(l => getReportCount(l._id) > 0).length
  };

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cherry-50 rounded-xl flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">Manage Lessons</h1>
            </div>
            <p className="text-text-secondary">View and manage all lessons on the platform</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cherry-50 rounded-lg flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.total}</p>
                <p className="text-xs text-text-secondary">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <HiOutlineGlobeAlt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.public}</p>
                <p className="text-xs text-text-secondary">Public</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <HiOutlineLockClosed className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.private}</p>
                <p className="text-xs text-text-secondary">Private</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.featured}</p>
                <p className="text-xs text-text-secondary">Featured</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.flagged}</p>
                <p className="text-xs text-text-secondary">Flagged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                  showFilters ? 'border-cherry bg-cherry-50 text-cherry' : 'border-gray-200 text-text-secondary hover:border-cherry'
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
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Visibility</label>
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Access Level</label>
                <select
                  value={filterAccessLevel}
                  onChange={(e) => setFilterAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Featured</label>
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
                >
                  <option value="">All</option>
                  <option value="featured">Featured Only</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none text-sm"
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
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={lesson.image}
                          alt={lesson.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="max-w-xs">
                          <h4 className="font-medium text-text truncate">{lesson.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-cherry-50 text-cherry px-2 py-0.5 rounded-full">
                              {lesson.category}
                            </span>
                            {lesson.isFeatured && (
                              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
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
                          src={lesson.creatorPhoto}
                          alt={lesson.creatorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-text">{lesson.creatorName}</p>
                          <p className="text-xs text-text-secondary">{lesson.creatorEmail}</p>
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
                        <span className="flex items-center gap-1 text-text-secondary">
                          <HiOutlineHeart className="w-4 h-4 text-red-400" />
                          {lesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1 text-text-secondary">
                          <HiOutlineBookmark className="w-4 h-4 text-blue-400" />
                          {lesson.favoritesCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(lesson.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/lessons/${lesson._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Lesson"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(lesson)}
                          className={`p-2 rounded-lg transition-colors ${
                            lesson.isFeatured 
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                              : 'text-gray-400 hover:bg-gray-100 hover:text-amber-600'
                          }`}
                          title={lesson.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                        >
                          <HiOutlineSparkles className="w-5 h-5" />
                        </button>
                        {!lesson.isReviewed && (
                          <button
                            onClick={() => handleMarkReviewed(lesson)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Reviewed"
                          >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Lesson"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedLessons.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineBookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No lessons found</h3>
              <p className="text-text-secondary">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLessons.length)} of {filteredLessons.length} lessons
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedLesson.isFeatured ? 'bg-gray-100' : 'bg-amber-100'
                }`}>
                  <HiOutlineSparkles className={`w-6 h-6 ${
                    selectedLesson.isFeatured ? 'text-gray-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">
                    {selectedLesson.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                  </h3>
                  <p className="text-sm text-text-secondary">Confirm this action</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedLesson.image}
                    alt={selectedLesson.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text line-clamp-1">{selectedLesson.title}</h4>
                    <p className="text-sm text-text-secondary">by {selectedLesson.creatorName}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                {selectedLesson.isFeatured 
                  ? 'This lesson will be removed from the featured section and will no longer appear in the homepage spotlight.'
                  : 'This lesson will be added to the featured section and will be highlighted on the homepage for all users to see.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeatureModal(false);
                    setSelectedLesson(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleFeatured}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    selectedLesson.isFeatured 
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Delete Lesson</h3>
                  <p className="text-sm text-text-secondary">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedLesson.image}
                    alt={selectedLesson.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text line-clamp-1">{selectedLesson.title}</h4>
                    <p className="text-sm text-text-secondary">by {selectedLesson.creatorName}</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this lesson? This will permanently remove all associated data including comments and reports.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLesson(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors"
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
