// My Lessons Page - LifeCherry Dashboard
import React, { useEffect, useMemo, useState } from 'react';
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
  HiOutlineChevronRight,
  HiOutlineListBullet,
  HiOutlineSquares2X2
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { categories, emotionalTones } from '../../data/lessons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';

const MyLessons = () => {
  useDocumentTitle('My Lessons');
  const { firebaseUser, userProfile, authLoading, profileLoading, authInitialized } = useAuth();
  const queryClient = useQueryClient();
  const userEmail = firebaseUser?.email?.toLowerCase() || '';
  const isPremium = !!userProfile?.isPremium || userProfile?.role === 'admin';

  const lessonsQuery = useQuery({
    queryKey: ['my-lessons', userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await apiClient.get(`/lessons/user/${userEmail}`);
      return res.data?.lessons || [];
    },
    retry: 1,
  });

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonsData, setLessonsData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = authLoading || profileLoading || !authInitialized || lessonsQuery.isLoading;

  useEffect(() => {
    if (lessonsQuery.data) {
      setLessonsData(lessonsQuery.data);
    }
  }, [lessonsQuery.data]);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('myLessonsViewMode');
    return saved || 'list'; // Default to list view
  });

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('myLessonsViewMode', mode);
  };

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

  // Format date - compact single line format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.patch(`/lessons/${id}`, data);
      return res.data?.lesson || res.data;
    },
    onSuccess: (updated) => {
      const matchId = updated?._id || updated?.id;
      if (!matchId) return;
      setLessonsData((prev) =>
        prev.map((lesson) =>
          lesson._id === matchId || lesson.id === matchId ? { ...lesson, ...updated } : lesson
        )
      );
      queryClient.setQueryData(['my-lessons', userEmail], (prev) =>
        Array.isArray(prev)
          ? prev.map((lesson) =>
            lesson._id === matchId || lesson.id === matchId ? { ...lesson, ...updated } : lesson
          )
          : prev
      );
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update lesson';
      toast.error(message);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(`/lessons/${id}`),
    onSuccess: (_, id) => {
      setLessonsData((prev) => prev.filter((lesson) => lesson._id !== id && lesson.id !== id));
      queryClient.setQueryData(['my-lessons', userEmail], (prev) =>
        Array.isArray(prev) ? prev.filter((lesson) => lesson._id !== id && lesson.id !== id) : prev
      );
      toast.success('Lesson deleted successfully');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete lesson';
      toast.error(message);
    },
  });

  // Handle visibility toggle with warning toast
  const handleVisibilityChange = (lessonId, currentVisibility, newVisibility) => {
    const lesson = lessonsData.find(l => l._id === lessonId);
    const lessonTitle = lesson?.title || 'This lesson';

    // Define warning messages based on visibility change
    const warningMessages = {
      public: {
        icon: '🌍',
        title: 'Make Lesson Public?',
        message: `"${lessonTitle}" will be visible to everyone on LifeCherry.`,
        warning: 'Anyone can view and interact with this lesson.'
      },
      private: {
        icon: '🔒',
        title: 'Make Lesson Private?',
        message: `"${lessonTitle}" will be hidden from the public.`,
        warning: 'Only you will be able to see this lesson.'
      }
    };

    const config = warningMessages[newVisibility];

    toast(
      (t) => (
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{config.title}</p>
              <p className="text-sm text-gray-600 mt-1">{config.message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                updateLessonMutation.mutate(
                  { id: lessonId, data: { visibility: newVisibility } },
                  {
                    onSuccess: () => {
                      toast.success(
                        newVisibility === 'public'
                          ? '🌍 Lesson is now public!'
                          : '🔒 Lesson is now private!',
                        { duration: 3000 }
                      );
                    },
                  }
                );
              }}
              className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors ${newVisibility === 'public'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-700 hover:bg-gray-800'
                }`}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center',
        style: {
          background: '#fff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }
      }
    );
  };

  // Handle access level toggle with warning toast (only for premium users)
  const handleAccessLevelChange = (lessonId, currentAccessLevel, newAccessLevel) => {
    if (!isPremium && newAccessLevel === 'premium') {
      toast.error('Upgrade to Premium to set premium access level', {
        icon: '👑',
        duration: 4000
      });
      return;
    }

    const lesson = lessonsData.find(l => l._id === lessonId);
    const lessonTitle = lesson?.title || 'This lesson';

    // Define warning messages based on access level change
    const warningMessages = {
      free: {
        icon: '🆓',
        title: 'Make Lesson Free?',
        message: `"${lessonTitle}" will be accessible to all users.`,
        warning: 'Both free and premium users can access this lesson.'
      },
      premium: {
        icon: '👑',
        title: 'Make Lesson Premium?',
        message: `"${lessonTitle}" will be exclusive to premium members.`,
        warning: 'Free users will need to upgrade to access this lesson.'
      }
    };

    const config = warningMessages[newAccessLevel];

    toast(
      (t) => (
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{config.title}</p>
              <p className="text-sm text-gray-600 mt-1">{config.message}</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                {config.warning}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                updateLessonMutation.mutate(
                  { id: lessonId, data: { accessLevel: newAccessLevel } },
                  {
                    onSuccess: () => {
                      toast.success(
                        newAccessLevel === 'premium'
                          ? '👑 Lesson is now Premium only!'
                          : '🆓 Lesson is now Free for all!',
                        { duration: 3000 }
                      );
                    },
                  }
                );
              }}
              className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors ${newAccessLevel === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                : 'bg-green-500 hover:bg-green-600'
                }`}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center',
        style: {
          background: '#fff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }
      }
    );
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
    try {
      await updateLessonMutation.mutateAsync({ id: selectedLesson._id, data: editFormData });
      toast.success('Lesson updated successfully! 🎉');
      setShowEditModal(false);
      setSelectedLesson(null);
    } catch (error) {
      // Error handled in mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteModal(true);
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    setIsSubmitting(true);
    deleteLessonMutation
      .mutateAsync(selectedLesson._id)
      .then(() => {
        setShowDeleteModal(false);
        setSelectedLesson(null);
      })
      .catch(() => { })
      .finally(() => setIsSubmitting(false));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterVisibility('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterCategory || filterVisibility;

  if (isLoading) {
    return (
      <PageLoader>
        <div className="max-w-3xl mx-auto py-16 text-center text-text-secondary">
          Loading your lessons...
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Page Header */}
        <DashboardPageHeader
          icon={HiOutlineBookOpen}
          title="My Lessons"
          description="Manage and organize all your life lessons"
        >
          <Link
            to="/dashboard/add-lesson"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
          >
            <HiOutlineSparkles className="w-5 h-5" />
            Add New Lesson
          </Link>
        </DashboardPageHeader>

        {lessonsQuery.isError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            Could not load your lessons. Please refresh and try again.
          </div>
        )}

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
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-3 transition-all duration-200 cursor-pointer ${viewMode === 'list'
                    ? 'bg-cherry text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                    }`}
                  title="List View"
                >
                  <HiOutlineListBullet className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-3 transition-all duration-200 cursor-pointer ${viewMode === 'grid'
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
                className={`inline-flex items-center gap-2 px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${showFilters || hasActiveFilters
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
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedLessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          {lesson.image ? (
                            <img
                              src={lesson.image}
                              alt={lesson.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cherry-50 to-cherry-100 flex items-center justify-center">
                              <HiOutlineBookOpen className="w-12 h-12 text-cherry" />
                            </div>
                          )}
                          {/* Visibility & Access Badges */}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${lesson.visibility === 'public'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-700 text-white'
                              }`}>
                              {lesson.visibility === 'public' ? (
                                <HiOutlineGlobeAlt className="w-3 h-3" />
                              ) : (
                                <HiOutlineLockClosed className="w-3 h-3" />
                              )}
                              {lesson.visibility}
                            </span>
                          </div>
                          {lesson.accessLevel === 'premium' && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-amber-400 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <HiOutlineStar className="w-3 h-3" />
                              Premium
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-cherry">
                              {lesson.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-cherry transition-colors">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-text-muted mb-2">{lesson.emotionalTone}</p>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-sm text-text-muted mb-3">
                            <span className="flex items-center gap-1">
                              <HiOutlineHeart className="w-4 h-4 text-red-400" />
                              {lesson.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiOutlineBookmark className="w-4 h-4 text-amber-400" />
                              {lesson.favoritesCount}
                            </span>
                            <span className="text-xs">{formatDate(lesson.createdAt)}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/lessons/${lesson._id}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              View
                            </Link>
                            <button
                              onClick={() => openEditModal(lesson)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                              title="Edit"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(lesson)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                              title="Delete"
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text">Visibility</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text">Access</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text">Stats</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text">Created</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-text">Updated</th>
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
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-cherry-50 text-cherry whitespace-nowrap">
                              {lesson.category}
                            </span>
                          </td>

                          {/* Visibility Toggle */}
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => lesson.visibility !== 'public' && handleVisibilityChange(lesson._id, lesson.visibility, 'public')}
                                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${lesson.visibility === 'public'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                title="Public"
                              >
                                <HiOutlineGlobeAlt className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => lesson.visibility !== 'private' && handleVisibilityChange(lesson._id, lesson.visibility, 'private')}
                                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${lesson.visibility === 'private'
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
                                onClick={() => lesson.accessLevel !== 'free' && handleAccessLevelChange(lesson._id, lesson.accessLevel, 'free')}
                                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${lesson.accessLevel === 'free'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                title="Free"
                              >
                                <HiOutlineLockOpen className="w-4 h-4" />
                              </button>
                              <div
                                className={!isPremium ? 'tooltip tooltip-top before:bg-black before:text-white after:border-t-black before:rounded-lg' : ''}
                                data-tip="Upgrade to Premium to create paid lessons"
                              >
                                <button
                                  onClick={() => lesson.accessLevel !== 'premium' && handleAccessLevelChange(lesson._id, lesson.accessLevel, 'premium')}
                                  disabled={!isPremium}
                                  className={`p-2 rounded-lg transition-all duration-200 ${!isPremium
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                                    : lesson.accessLevel === 'premium'
                                      ? 'bg-amber-100 text-amber-600 cursor-pointer'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
                                    }`}
                                  title={isPremium ? 'Premium' : ''}
                                >
                                  <HiOutlineStar className="w-4 h-4" />
                                </button>
                              </div>
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
                            <span className="text-sm text-text-muted whitespace-nowrap">
                              {formatDate(lesson.createdAt)}
                            </span>
                          </td>

                          {/* Updated Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-text-muted whitespace-nowrap">
                              {lesson.updatedAt ? formatDate(lesson.updatedAt) : '—'}
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
              )}

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-border">
                {paginatedLessons.map((lesson) => (
                  <div key={lesson._id} className="p-4 bg-white rounded-xl mb-4 border border-border shadow-sm">
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-text truncate text-sm sm:text-base">{lesson.title}</h3>
                          {lesson.accessLevel === 'premium' && (
                            <span className="flex-shrink-0">
                              <HiOutlineStar className="w-4 h-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{lesson.emotionalTone}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cherry-50 text-cherry">
                            {lesson.category}
                          </span>
                          <span className="text-[10px] text-text-muted">{formatDate(lesson.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Stats & Toggles */}
                    <div className="flex items-center justify-between gap-2 mb-4 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <HiOutlineHeart className="w-3.5 h-3.5 text-red-400" />
                          {lesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineBookmark className="w-3.5 h-3.5 text-amber-400" />
                          {lesson.favoritesCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Visibility */}
                        <button
                          onClick={() => handleVisibilityChange(lesson._id, lesson.visibility, lesson.visibility === 'public' ? 'private' : 'public')}
                          className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${lesson.visibility === 'public'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-700 text-white'
                            }`}
                          title={lesson.visibility === 'public' ? 'Public' : 'Private'}
                        >
                          {lesson.visibility === 'public' ? (
                            <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
                          ) : (
                            <HiOutlineLockClosed className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Access Level */}
                        <button
                          onClick={() => isPremium && handleAccessLevelChange(lesson._id, lesson.accessLevel, lesson.accessLevel === 'free' ? 'premium' : 'free')}
                          disabled={!isPremium}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${!isPremium
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                            : lesson.accessLevel === 'premium'
                              ? 'bg-amber-100 text-amber-600 cursor-pointer'
                              : 'bg-blue-100 text-blue-600 cursor-pointer'
                            }`}
                          title={lesson.accessLevel === 'free' ? 'Free' : 'Premium'}
                        >
                          {lesson.accessLevel === 'premium' ? (
                            <HiOutlineStar className="w-3.5 h-3.5" />
                          ) : (
                            <HiOutlineLockOpen className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(lesson)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 md:px-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-text-muted text-center sm:text-left">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLessons.length)} of {filteredLessons.length} lessons
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg border border-border hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiOutlineChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${currentPage === i + 1
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
                      className="p-1.5 sm:p-2 rounded-lg border border-border hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiOutlineChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${editFormData.visibility === 'public'
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
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${editFormData.visibility === 'private'
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
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${editFormData.accessLevel === 'free'
                          ? 'border-cherry bg-cherry-50 text-cherry'
                          : 'border-gray-200 text-text-secondary hover:border-gray-300'
                          }`}
                      >
                        <HiOutlineLockOpen className="w-4 h-4" />
                        Free
                      </button>
                      <div
                        className={`flex-1 ${!isPremium ? 'tooltip tooltip-top before:bg-black before:text-white after:border-t-black before:rounded-lg' : ''}`}
                        data-tip="Upgrade to Premium to create paid lessons"
                      >
                        <button
                          type="button"
                          onClick={() => isPremium && setEditFormData(prev => ({ ...prev, accessLevel: 'premium' }))}
                          disabled={!isPremium}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${!isPremium
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
