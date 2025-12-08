// Lesson Details Page - LifeCherry
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiHeart, 
  FiBookmark, 
  FiMessageCircle, 
  FiShare2, 
  FiCalendar, 
  FiLock,
  FiSend,
  FiSmile,
  FiFlag,
  FiEye,
  FiClock,
  FiEdit3,
  FiX,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  XIcon,
  LinkedinIcon,
  WhatsappIcon
} from 'react-share';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import apiClient from '../utils/apiClient';
import useAuth from '../hooks/useAuth';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, userProfile, authLoading } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic page title based on lesson
  useDocumentTitle(lesson ? lesson.title : 'Lesson Not Found');

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isLoggedIn = !!firebaseUser;
  const isUserPremium = !!userProfile?.isPremium;
  const currentUser = firebaseUser || null;
  const hasRecordedViewRef = useRef(false);
  const visibilityStartRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get(`/lessons/${id}`);
        if (!isMounted) return;
        setLesson(data?.lesson || null);
        setLikesCount(data?.lesson?.likesCount || 0);
        setFavoritesCount(data?.lesson?.favoritesCount || 0);
        
        // Check if current user has already liked/favorited
        if (firebaseUser?.email && data?.lesson) {
          const userEmail = firebaseUser.email.toLowerCase();
          setIsLiked(data?.lesson?.likes?.includes(userEmail) || false);
          setIsSaved(data?.lesson?.favorites?.includes(userEmail) || false);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err?.response?.status === 404) {
          setError('not-found');
        } else if (err?.response?.status === 401) {
          setError('auth');
        } else if (err?.response?.status === 403) {
          setError('forbidden');
        } else {
          setError('unknown');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLesson();
    return () => {
      isMounted = false;
    };
  }, [id, firebaseUser?.email]);

  useEffect(() => {
    let isMounted = true;
    const fetchAllLessons = async () => {
      try {
        const { data } = await apiClient.get('/lessons', { params: { limit: 100, sort: '-createdAt' } });
        if (!isMounted) return;
        setAllLessons(data?.lessons || []);
      } catch (err) {
        // best-effort, no hard failure
      }
    };

    fetchAllLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Views come from API
  const viewsCount = lesson?.views || 0;

  // Calculate reading time (avg 200 words per minute)
  const readingTime = useMemo(() => {
    if (!lesson) return 0;
    const words = lesson.description.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [lesson]);

  // Get creator's total lessons
  const creatorLessonsCount = useMemo(() => {
    if (!lesson) return 0;
    return allLessons.filter((l) => l.creatorEmail === lesson.creatorEmail).length;
  }, [lesson, allLessons]);

  // Get related lessons by category (excluding current)
  const relatedByCategory = useMemo(() => {
    if (!lesson) return [];
    return allLessons
      .filter((l) => l.category === lesson.category && l._id !== id && l.visibility === 'public')
      .slice(0, 6);
  }, [lesson, id, allLessons]);

  // Get similar lessons by emotional tone (excluding current and category duplicates)
  const similarByTone = useMemo(() => {
    if (!lesson) return [];
    const categoryIds = relatedByCategory.map(l => l._id);
    return allLessons
      .filter(l => 
        l.emotionalTone === lesson.emotionalTone && 
        l._id !== id && 
        l.visibility === 'public' &&
        !categoryIds.includes(l._id)
      )
      .slice(0, 6);
  }, [lesson, id, relatedByCategory, allLessons]);

  // Reset state when lesson id changes
  useEffect(() => {
    if (lesson) {
      setLikesCount(lesson.likesCount || 0);
      setFavoritesCount(lesson.favoritesCount || 0);
      setComments([]);
      setIsLiked(false);
      setIsSaved(false);
      setShowShareDropdown(false);
      setShowReportModal(false);
      setReportSubmitted(false);
      hasRecordedViewRef.current = false;
      elapsedRef.current = 0;
      visibilityStartRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Track engaged view time and record a view after 70% of reading time
  useEffect(() => {
    if (!lesson || !isLoggedIn || hasRecordedViewRef.current || authLoading) return undefined;

    const targetMs = Math.max(15000, Math.round(readingTime * 0.7 * 60 * 1000)); // at least 15s

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        visibilityStartRef.current = Date.now();
      } else if (visibilityStartRef.current) {
        elapsedRef.current += Date.now() - visibilityStartRef.current;
        visibilityStartRef.current = null;
      }

      const total = elapsedRef.current + (visibilityStartRef.current ? Date.now() - visibilityStartRef.current : 0);
      if (total >= targetMs && !hasRecordedViewRef.current) {
        hasRecordedViewRef.current = true;
        recordView();
      }
    };

    const recordView = async () => {
      try {
        const { data } = await apiClient.post(`/lessons/${id}/view`);
        if (data?.views !== undefined) {
          setLesson((prev) => (prev ? { ...prev, views: data.views } : prev));
        }
      } catch (err) {
        // silent fail
      }
    };

    const interval = setInterval(onVisible, 2000);
    document.addEventListener('visibilitychange', onVisible);
    onVisible();

    return () => {
      if (visibilityStartRef.current) {
        elapsedRef.current += Date.now() - visibilityStartRef.current;
      }
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, [lesson, isLoggedIn, authLoading, id, readingTime]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format short date
  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  // Format number (1000 -> 1K)
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  // Handle like
  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Prevent liking own lesson
    if (lesson?.creatorEmail === firebaseUser?.email) {
      return;
    }

    setLikeLoading(true);
    try {
      const { data } = await apiClient.post(`/lessons/${id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle save/bookmark
  const handleSave = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Prevent saving own lesson
    if (lesson?.creatorEmail === firebaseUser?.email) {
      return;
    }

    setFavoriteLoading(true);
    try {
      const { data } = await apiClient.post(`/lessons/${id}/favorite`);
      setIsSaved(data.isFavorited);
      setFavoritesCount(data.favoritesCount);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle report submit
  const handleReportSubmit = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!reportReason) return;
    
    // In real app, this would be an API call
    console.log('Report submitted:', {
      lessonId: id,
      reason: reportReason,
      reporterEmail: currentUser?.email,
      timestamp: new Date().toISOString()
    });
    
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportReason('');
      setReportSubmitted(false);
    }, 2000);
  };

  // Handle comment submit
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    const newCommentObj = {
      _id: `c${Date.now()}`,
      lessonId: id,
      userEmail: currentUser?.email || 'user@example.com',
      userName: currentUser?.displayName || 'Current User',
      userPhoto: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareDropdown(false);
  };

  // Get emotional tone color
  const getToneColor = (tone) => {
    const colors = {
      'Motivational': 'bg-green-100 text-green-700',
      'Realization': 'bg-blue-100 text-blue-700',
      'Sad': 'bg-purple-100 text-purple-700',
      'Funny': 'bg-yellow-100 text-yellow-700',
      'Gratitude': 'bg-pink-100 text-pink-700',
      'Regret': 'bg-red-100 text-red-700',
      'Hope': 'bg-teal-100 text-teal-700',
      'Fear': 'bg-gray-100 text-gray-700',
      'Anger': 'bg-orange-100 text-orange-700',
      'Love': 'bg-rose-100 text-rose-700'
    };
    return colors[tone] || 'bg-gray-100 text-gray-700';
  };

  // Report reasons
  const reportReasons = [
    'Inappropriate Content',
    'Hate Speech or Harassment',
    'Misleading or False Information',
    'Spam or Promotional Content',
    'Sensitive or Disturbing Content',
    'Other'
  ];

  if (loading) {
    return (
      <PageLoader>
        <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white flex items-center justify-center text-text-secondary">
          Loading lesson...
        </div>
      </PageLoader>
    );
  }

  const notFound = error === 'not-found' || (!lesson && !loading);

  if (notFound) {
    return (
      <PageLoader>
        <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Lesson Not Found</h1>
            <p className="text-text-secondary mb-6">
              The lesson you're looking for doesn't exist, is private, or has been removed.
            </p>
            <Link 
              to="/public-lessons" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors"
            >
              ← Back to Lessons
            </Link>
          </div>
        </div>
      </PageLoader>
    );
  }

  if (error && !lesson) {
    return (
      <PageLoader>
        <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white flex items-center justify-center text-center px-6">
          <div className="max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Unable to load lesson</h1>
            <p className="text-text-secondary mb-6">Please try again. If this keeps happening, check your connection or sign in.</p>
            <Link 
              to="/public-lessons" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors"
            >
              ← Back to Lessons
            </Link>
          </div>
        </div>
      </PageLoader>
    );
  }

  // Check if premium content and user is not premium
  const isPremiumLocked = lesson.accessLevel === 'premium' && !isUserPremium;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${lesson.title} - LifeCherry`;

  return (
    <PageLoader>
      <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white">
        {/* Hero Section with Image */}
        <div className="relative h-[300px] md:h-[400px] lg:h-[450px]">
          <img 
            src={lesson.image} 
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Title & Meta on Image */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-4 flex-wrap">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link to="/public-lessons" className="hover:text-white transition-colors">Public Lessons</Link>
                <span>/</span>
                <span className="text-white line-clamp-1">{lesson.title}</span>
              </nav>

              {/* Category & Tone Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-cherry text-white rounded-full text-sm font-medium">
                  {lesson.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getToneColor(lesson.emotionalTone)}`}>
                  <FiSmile className="inline w-3.5 h-3.5 mr-1" />
                  {lesson.emotionalTone}
                </span>
                {lesson.accessLevel === 'premium' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-medium">
                    <FiLock className="w-3.5 h-3.5" />
                    Premium
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {lesson.title}
              </h1>
              
              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <img 
                    src={lesson.creatorPhoto} 
                    alt={lesson.creatorName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                  />
                  <span className="font-medium">{lesson.creatorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(lesson.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiClock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Buttons - All in One Line */}
          <div className="flex flex-wrap items-center gap-3 py-4 border-y border-gray-100 mb-8">
            {/* Like Button with Count */}
            <button 
              onClick={handleLike}
              disabled={likeLoading || lesson?.creatorEmail === firebaseUser?.email}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all cursor-pointer font-medium text-sm ${
                lesson?.creatorEmail === firebaseUser?.email 
                  ? 'bg-gray-50 text-text-muted cursor-not-allowed opacity-50'
                  : isLiked 
                    ? 'bg-cherry text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-cherry hover:text-white'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
              <span className="font-semibold">{formatNumber(likesCount)}</span>
            </button>

            {/* Save Button with Count */}
            <button 
              onClick={handleSave}
              disabled={favoriteLoading || lesson?.creatorEmail === firebaseUser?.email}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all cursor-pointer font-medium text-sm ${
                lesson?.creatorEmail === firebaseUser?.email
                  ? 'bg-gray-50 text-text-muted cursor-not-allowed opacity-50'
                  : isSaved 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-amber-500 hover:text-white'
              }`}
            >
              <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
              <span className="font-semibold">{formatNumber(favoritesCount)}</span>
            </button>

            {/* Views Count */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 text-text-secondary text-sm font-medium">
              <FiEye className="w-4 h-4 text-blue-500" />
              <span>{formatNumber(viewsCount)} Views</span>
            </div>

            {/* Comments Count */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 text-text-secondary text-sm font-medium">
              <FiMessageCircle className="w-4 h-4 text-green-500" />
              <span>{comments.length} Comments</span>
            </div>

            {/* Report Button */}
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 text-text-secondary hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer font-medium text-sm"
            >
              <FiFlag className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>

            {/* Share Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowShareDropdown(!showShareDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 text-text-secondary hover:bg-blue-100 hover:text-blue-600 transition-all cursor-pointer font-medium text-sm"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              {/* Share Dropdown */}
              {showShareDropdown && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50 min-w-[200px]">
                  <p className="text-sm font-medium text-text-primary mb-3">Share this lesson</p>
                  <div className="flex items-center gap-2 mb-3">
                    <FacebookShareButton url={shareUrl} hashtag="#LifeCherry">
                      <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <XIcon size={40} round />
                    </TwitterShareButton>
                    <LinkedinShareButton url={shareUrl} title={shareTitle}>
                      <LinkedinIcon size={40} round />
                    </LinkedinShareButton>
                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Premium Lock Overlay */}
          {isPremiumLocked ? (
            <div className="relative">
              {/* Blurred Content Preview */}
              <div className="blur-md select-none pointer-events-none">
                <p className="text-lg text-text-secondary leading-relaxed">
                  {lesson.description.substring(0, 200)}...
                </p>
              </div>
              
              {/* Lock Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <FiLock className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Premium Content</h3>
                  <p className="text-text-secondary mb-4">
                    This lesson is available exclusively for premium members.
                  </p>
                  <Link 
                    to="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Lesson Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed whitespace-pre-line">
                  {lesson.description}
                </p>
              </div>

              {/* Lesson Metadata */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cherry-50 flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-cherry" />
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block">Created</span>
                      <p className="font-semibold text-text-primary">{formatShortDate(lesson.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <FiEdit3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block">Last Updated</span>
                      <p className="font-semibold text-text-primary">{formatShortDate(lesson.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <FiEye className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block">Visibility</span>
                      <p className="font-semibold text-text-primary capitalize">{lesson.visibility}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block">Reading Time</span>
                      <p className="font-semibold text-text-primary">{readingTime} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-12 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img 
                    src={lesson.creatorPhoto} 
                    alt={lesson.creatorName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cherry-100"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-text-muted mb-1">Written by</p>
                    <h3 className="text-xl font-bold text-text-primary mb-1">{lesson.creatorName}</h3>
                    <p className="text-text-secondary text-sm flex items-center gap-2">
                      <FiEdit3 className="w-4 h-4" />
                      {creatorLessonsCount} lessons created
                    </p>
                  </div>
                  <Link 
                    to={`/profile/${lesson.creatorEmail}`}
                    className="px-5 py-2.5 border-2 border-cherry text-cherry rounded-xl font-medium hover:bg-cherry hover:!text-white transition-all"
                  >
                    View All Lessons
                  </Link>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <FiMessageCircle className="w-6 h-6 text-cherry" />
                  Comments ({comments.length})
                </h2>

                {/* Comment Form */}
                {isLoggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex gap-3">
                      <img 
                        src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all resize-none text-text-primary"
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 bg-cherry text-white rounded-xl font-medium hover:bg-cherry-dark transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!newComment.trim()}
                          >
                            <FiSend className="w-4 h-4" />
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
                    <FiMessageCircle className="w-8 h-8 text-cherry" />
                    <div>
                      <p className="font-semibold text-text-primary">Login to comment</p>
                      <p className="text-sm text-text-secondary">Join the conversation to share your thoughts.</p>
                    </div>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-cherry text-white rounded-xl font-medium hover:bg-cherry-dark transition-all"
                    >
                      <FiSend className="w-4 h-4" />
                      Login to comment
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment._id} className="flex gap-3 group">
                        <img 
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 group-hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-text-primary">{comment.userName}</span>
                            <span className="text-sm text-text-muted">•</span>
                            <span className="text-sm text-text-muted">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-text-secondary">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-text-muted">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Related Lessons by Category */}
          {relatedByCategory.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Similar Lessons in {lesson.category}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedByCategory.slice(0, 6).map(relatedLesson => (
                  <Link 
                    key={relatedLesson._id}
                    to={`/lessons/${relatedLesson._id}`}
                    className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={relatedLesson.image}
                        alt={relatedLesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedLesson.accessLevel === 'premium' && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
                          <FiLock className="w-3 h-3" />
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-cherry mb-1 block">{relatedLesson.category}</span>
                      <h3 className="font-bold text-text-primary group-hover:text-cherry transition-colors line-clamp-2">
                        {relatedLesson.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          {relatedLesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBookmark className="w-4 h-4" />
                          {relatedLesson.favoritesCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar Lessons by Emotional Tone */}
          {similarByTone.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">More {lesson.emotionalTone} Lessons</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarByTone.slice(0, 6).map(similarLesson => (
                  <Link 
                    key={similarLesson._id}
                    to={`/lessons/${similarLesson._id}`}
                    className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={similarLesson.image}
                        alt={similarLesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {similarLesson.accessLevel === 'premium' && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
                          <FiLock className="w-3 h-3" />
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-cherry">{similarLesson.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getToneColor(similarLesson.emotionalTone)}`}>
                          {similarLesson.emotionalTone}
                        </span>
                      </div>
                      <h3 className="font-bold text-text-primary group-hover:text-cherry transition-colors line-clamp-2">
                        {similarLesson.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          {similarLesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBookmark className="w-4 h-4" />
                          {similarLesson.favoritesCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              {reportSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Report Submitted</h3>
                  <p className="text-text-secondary">Thank you for helping keep our community safe.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <FiFlag className="w-5 h-5 text-red-500" />
                      Report Lesson
                    </h3>
                    <button 
                      onClick={() => setShowReportModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-text-secondary mb-4">
                    Why are you reporting this lesson?
                  </p>
                  
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-cherry-100 outline-none transition-all mb-6 text-text-primary"
                  >
                    <option value="">Select a reason...</option>
                    {reportReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 text-text-secondary rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReportSubmit}
                      disabled={!reportReason}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close share dropdown */}
        {showShareDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowShareDropdown(false)}
          />
        )}
      </div>
    </PageLoader>
  );
};

export default LessonDetails;
