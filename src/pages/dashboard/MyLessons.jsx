// My Lessons Page - LifeCherry Dashboard
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineBookOpen,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineStar,
  HiOutlineHeart,
  HiOutlineBookmark,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineLockOpen,
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { lessons, categories, emotionalTones } from '../../data/lessons';

const MyLessons = () => {
  useDocumentTitle('My Lessons');
  
  // Dummy user for UI development
  const dummyUser = {
    name: 'Omar Faruk',
    email: 'omar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isPremium: true
  };

  // Get user's lessons (simulating filtering by user email)
  // For demo, we use all lessons as if they belong to the current user
  const userLessons = lessons;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonsData, setLessonsData] = useState(userLessons);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    emotionalTone: '',
    image: '',
    visibility: 'public',
    accessLevel: 'free'
  });

  const ITEMS_PER_PAGE = 8;

  // Filter and search
  const filteredLessons = useMemo(() => {
    let result = [...lessonsData];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lesson =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.description.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      result = result.filter(lesson => lesson.category === filterCategory);
    }

    if (filterVisibility) {
      result = result.filter(lesson => lesson.visibility === filterVisibility);
    }

    return result;
  }, [lessonsData, searchQuery, filterCategory, filterVisibility]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle visibility toggle
  const handleVisibilityChange = (lessonId, newVisibility) => {
    setLessonsData(prev => 
      prev.map(lesson => 
        lesson._id === lessonId 
          ? { ...lesson, visibility: newVisibility }
          : lesson
      )
    );
    toast.success(`Lesson visibility changed to ${newVisibility}`);
  };

  // Handle access level toggle (only for premium users)
  const handleAccessLevelChange = (lessonId, newAccessLevel) => {
    if (!dummyUser.isPremium && newAccessLevel === 'premium') {
      toast.error('Upgrade to Premium to set premium access level');
      return;
    }
    setLessonsData(prev => 
      prev.map(lesson => 
        lesson._id === lessonId 
          ? { ...lesson, accessLevel: newAccessLevel }
          : lesson
      )
    );
    toast.success(`Access level changed to ${newAccessLevel}`);
  };

  // Open edit modal
  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setEditFormData({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      emotionalTone: lesson.emotionalTone,
      image: lesson.image || '',
      visibility: lesson.visibility,
      accessLevel: lesson.accessLevel
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle update lesson
  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }
    if (!editFormData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setLessonsData(prev =>
        prev.map(lesson =>
          lesson._id === selectedLesson._id
            ? { 
                ...lesson, 
                ...editFormData,
                updatedAt: new Date().toISOString()
              }
            : lesson
        )
      );
      toast.success('Lesson updated successfully! 🎉');
      setShowEditModal(false);
      setSelectedLesson(null);
      setIsSubmitting(false);
    }, 1500);
  };

  // Open delete confirmation modal
  const openDeleteModal = (lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteModal(true);
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setLessonsData(prev => prev.filter(lesson => lesson._id !== selectedLesson._id));
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
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterCategory || filterVisibility;

  return (
    <PageLoader>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">My Lessons</h1>
              <p className="text-text-secondary">Manage and organize all your life lessons</p>
            </div>
            <Link
              to="/dashboard/add-lesson"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <HiOutlineSparkles className="w-5 h-5" />
              Add New Lesson
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cherry-50 rounded-xl">
                <HiOutlineBookOpen className="w-6 h-6 text-cherry" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{lessonsData.length}</p>
                <p className="text-sm text-text-muted">Total Lessons</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <HiOutlineGlobeAlt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">
                  {lessonsData.filter(l => l.visibility === 'public').length}
                </p>
                <p className="text-sm text-text-muted">Public Lessons</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <HiOutlineStar className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">
                  {lessonsData.filter(l => l.accessLevel === 'premium').length}
                </p>
                <p className="text-sm text-text-muted">Premium Lessons</p>
              </div>
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
                placeholder="Search lessons by title or description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Toggles */}
            <div className="flex gap-3">
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
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Visibility</label>
                <select
                  value={filterVisibility}
                  onChange={(e) => {
                    setFilterVisibility(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="">All Visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Lessons Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          {filteredLessons.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No lessons found</h3>
              <p className="text-text-muted mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search query'
                  : "You haven't created any lessons yet"
                }
              </p>
              {!hasActiveFilters && (
                <Link
                  to="/dashboard/add-lesson"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 cursor-pointer"
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                  Create Your First Lesson
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Lesson</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Category</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Visibility</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Access</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Stats</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-text">Created</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedLessons.map((lesson) => (
                      <tr key={lesson._id} className="hover:bg-gray-50 transition-colors">
                        {/* Lesson Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {lesson.image ? (
                              <img 
                                src={lesson.image} 
                                alt={lesson.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-cherry-50 flex items-center justify-center flex-shrink-0">
                                <HiOutlineBookOpen className="w-6 h-6 text-cherry" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-semibold text-text truncate max-w-[200px]">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-text-muted truncate max-w-[200px]">
                                {lesson.emotionalTone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cherry-50 text-cherry">
                            {lesson.category}
                          </span>
                        </td>

                        {/* Visibility Toggle */}
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleVisibilityChange(lesson._id, 'public')}
                              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                lesson.visibility === 'public'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title="Public"
                            >
                              <HiOutlineGlobeAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVisibilityChange(lesson._id, 'private')}
                              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                lesson.visibility === 'private'
                                  ? 'bg-gray-700 text-white'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title="Private"
                            >
                              <HiOutlineLockClosed className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Access Level Toggle */}
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAccessLevelChange(lesson._id, 'free')}
                              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                lesson.accessLevel === 'free'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title="Free"
                            >
                              <HiOutlineLockOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAccessLevelChange(lesson._id, 'premium')}
                              disabled={!dummyUser.isPremium}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                !dummyUser.isPremium 
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                                  : lesson.accessLevel === 'premium'
                                    ? 'bg-amber-100 text-amber-600 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
                              }`}
                              title={dummyUser.isPremium ? 'Premium' : 'Upgrade to set premium'}
                            >
                              <HiOutlineStar className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <HiOutlineHeart className="w-4 h-4 text-red-400" />
                              {lesson.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiOutlineBookmark className="w-4 h-4 text-amber-400" />
                              {lesson.favoritesCount}
                            </span>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted">
                            {formatDate(lesson.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/lessons/${lesson._id}`}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEditModal(lesson)}
                              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                              title="Edit"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(lesson)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 cursor-pointer"
                              title="Delete"
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

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border">
                {paginatedLessons.map((lesson) => (
                  <div key={lesson._id} className="p-4">
                    <div className="flex gap-3 mb-4">
                      {lesson.image ? (
                        <img 
                          src={lesson.image} 
                          alt={lesson.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-cherry-50 flex items-center justify-center flex-shrink-0">
                          <HiOutlineBookOpen className="w-8 h-8 text-cherry" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text truncate">{lesson.title}</h3>
                        <p className="text-sm text-text-muted">{lesson.emotionalTone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cherry-50 text-cherry">
                            {lesson.category}
                          </span>
                          <span className="text-xs text-text-muted">{formatDate(lesson.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Stats & Toggles */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <HiOutlineHeart className="w-4 h-4 text-red-400" />
                          {lesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineBookmark className="w-4 h-4 text-amber-400" />
                          {lesson.favoritesCount}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Visibility */}
                        <button
                          onClick={() => handleVisibilityChange(lesson._id, lesson.visibility === 'public' ? 'private' : 'public')}
                          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                            lesson.visibility === 'public'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-700 text-white'
                          }`}
                          title={lesson.visibility === 'public' ? 'Public' : 'Private'}
                        >
                          {lesson.visibility === 'public' ? (
                            <HiOutlineGlobeAlt className="w-4 h-4" />
                          ) : (
                            <HiOutlineLockClosed className="w-4 h-4" />
                          )}
                        </button>

                        {/* Access Level */}
                        <button
                          onClick={() => dummyUser.isPremium && handleAccessLevelChange(lesson._id, lesson.accessLevel === 'free' ? 'premium' : 'free')}
                          disabled={!dummyUser.isPremium}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            !dummyUser.isPremium 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                              : lesson.accessLevel === 'premium'
                                ? 'bg-amber-100 text-amber-600 cursor-pointer'
                                : 'bg-blue-100 text-blue-600 cursor-pointer'
                          }`}
                          title={lesson.accessLevel === 'free' ? 'Free' : 'Premium'}
                        >
                          {lesson.accessLevel === 'premium' ? (
                            <HiOutlineStar className="w-4 h-4" />
                          ) : (
                            <HiOutlineLockOpen className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-xl hover:bg-blue-200 transition-all duration-200 cursor-pointer text-sm"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(lesson)}
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
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLessons.length)} of {filteredLessons.length} lessons
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedLesson && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-text text-center mb-2">Delete Lesson?</h3>
              <p className="text-text-muted text-center mb-6">
                Are you sure you want to delete "<strong>{selectedLesson.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLesson(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLesson}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <HiOutlineTrash className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Lesson Modal */}
        {showEditModal && selectedLesson && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text">Edit Lesson</h3>
                  <p className="text-sm text-text-muted">Update your life lesson details</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLesson(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdateLesson} className="space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-semibold text-text mb-2">
                    Lesson Title <span className="text-cherry">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlinePencilSquare className="text-text-muted w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-semibold text-text mb-2">
                    Description <span className="text-cherry">*</span>
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Category & Emotional Tone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-semibold text-text mb-2">
                      Category <span className="text-cherry">*</span>
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-tone" className="block text-sm font-semibold text-text mb-2">
                      Emotional Tone <span className="text-cherry">*</span>
                    </label>
                    <select
                      id="edit-tone"
                      name="emotionalTone"
                      value={editFormData.emotionalTone}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select tone</option>
                      {emotionalTones.map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="edit-image" className="block text-sm font-semibold text-text mb-2">
                    <span className="flex items-center gap-2">
                      <HiOutlinePhoto className="w-4 h-4" />
                      Image URL
                      <span className="text-xs font-normal text-text-muted">(Optional)</span>
                    </span>
                  </label>
                  <input
                    type="url"
                    id="edit-image"
                    name="image"
                    value={editFormData.image}
                    onChange={handleEditChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                {/* Visibility & Access Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Visibility</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, visibility: 'public' }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          editFormData.visibility === 'public'
                            ? 'border-cherry bg-cherry-50 text-cherry'
                            : 'border-gray-200 text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <HiOutlineGlobeAlt className="w-4 h-4" />
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, visibility: 'private' }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          editFormData.visibility === 'private'
                            ? 'border-cherry bg-cherry-50 text-cherry'
                            : 'border-gray-200 text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <HiOutlineLockClosed className="w-4 h-4" />
                        Private
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Access Level</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, accessLevel: 'free' }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          editFormData.accessLevel === 'free'
                            ? 'border-cherry bg-cherry-50 text-cherry'
                            : 'border-gray-200 text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <HiOutlineLockOpen className="w-4 h-4" />
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => dummyUser.isPremium && setEditFormData(prev => ({ ...prev, accessLevel: 'premium' }))}
                        disabled={!dummyUser.isPremium}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          !dummyUser.isPremium 
                            ? 'opacity-50 cursor-not-allowed border-gray-200 text-text-muted'
                            : editFormData.accessLevel === 'premium'
                              ? 'border-amber-400 bg-amber-50 text-amber-600 cursor-pointer'
                              : 'border-gray-200 text-text-secondary hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        <HiOutlineStar className="w-4 h-4" />
                        Premium
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedLesson(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <HiOutlineSparkles className="w-5 h-5" />
                        Update Lesson
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default MyLessons;
