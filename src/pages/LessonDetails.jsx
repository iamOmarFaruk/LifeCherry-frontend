// Lesson Details Page - LifeCherry
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiHeart, 
  FiBookmark, 
  FiMessageCircle, 
  FiShare2, 
  FiCalendar, 
  FiUser, 
  FiLock,
  FiArrowLeft,
  FiSend,
  FiClock,
  FiTag,
  FiSmile
} from 'react-icons/fi';
import { lessons } from '../data/lessons';
import { getCommentsByLesson } from '../data/comments';
import PageLoader from '../components/shared/PageLoader';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the lesson
  const lesson = lessons.find(l => l._id === id);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(lesson?.likesCount || 0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(() => getCommentsByLesson(id));
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Simulating user status (will be from context later)
  const isLoggedIn = false;
  const isUserPremium = false;
  const currentUser = null;

  // Get related lessons (same category, excluding current)
  const relatedLessons = lessons
    .filter(l => l.category === lesson?.category && l._id !== id && l.visibility === 'public')
    .slice(0, 3);

  // Reset state when lesson id changes
  useEffect(() => {
    if (lesson) {
      setLikesCount(lesson.likesCount);
      setComments(getCommentsByLesson(id));
      setIsLiked(false);
      setIsSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  // Handle like
  const handleLike = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Handle save/bookmark
  const handleSave = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsSaved(!isSaved);
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson.title,
          text: `Check out this life lesson: ${lesson.title}`,
          url: shareUrl
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    // Add new comment (in real app, this would be an API call)
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

  // If lesson not found
  if (!lesson) {
    return (
      <PageLoader>
        <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Lesson Not Found</h1>
            <p className="text-text-secondary mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/public-lessons" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Lessons
            </Link>
          </div>
        </div>
      </PageLoader>
    );
  }

  // Check if premium content and user is not premium
  const isPremiumLocked = lesson.accessLevel === 'premium' && !isUserPremium;

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
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Premium Badge */}
          {lesson.accessLevel === 'premium' && (
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-medium">
              <FiLock className="w-4 h-4" />
              Premium
            </div>
          )}

          {/* Title & Meta on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Category & Tone Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-cherry text-white rounded-full text-sm font-medium">
                  {lesson.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getToneColor(lesson.emotionalTone)}`}>
                  <FiSmile className="inline w-3.5 h-3.5 mr-1" />
                  {lesson.emotionalTone}
                </span>
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Bar */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
                  isLiked 
                    ? 'bg-cherry text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likesCount}</span>
              </button>

              {/* Save Button */}
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                <span className="font-medium">{lesson.favoritesCount}</span>
              </button>

              {/* Comments Count */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-text-secondary">
                <FiMessageCircle className="w-5 h-5" />
                <span className="font-medium">{comments.length}</span>
              </div>
            </div>

            {/* Share Button */}
            <div className="relative">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiShare2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {showShareTooltip && (
                <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
                  Link copied!
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
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed whitespace-pre-line">
                  {lesson.description}
                </p>
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
                    <p className="text-text-secondary text-sm">
                      Sharing life experiences to help others grow
                    </p>
                  </div>
                  <button className="px-5 py-2.5 border-2 border-cherry text-cherry rounded-xl font-medium hover:bg-cherry hover:text-white transition-all cursor-pointer">
                    View Profile
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <FiMessageCircle className="w-6 h-6 text-cherry" />
                  Comments ({comments.length})
                </h2>

                {/* Comment Form */}
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
                        placeholder={isLoggedIn ? "Share your thoughts..." : "Login to leave a comment..."}
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

          {/* Related Lessons */}
          {relatedLessons.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">Related Lessons</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedLessons.map(relatedLesson => (
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
                      <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
                        <FiHeart className="w-4 h-4" />
                        <span>{relatedLesson.likesCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLoader>
  );
};

export default LessonDetails;
