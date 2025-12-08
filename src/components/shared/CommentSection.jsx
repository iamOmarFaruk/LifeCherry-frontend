import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import CommentCard from './CommentCard';
import Loading from './Loading';
import DOMPurify from 'dompurify';

// Helper function to count all replies recursively
const countAllReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  
  let count = replies.length;
  for (const reply of replies) {
    if (reply.replies && reply.replies.length > 0) {
      count += countAllReplies(reply.replies);
    }
  }
  return count;
};

export default function CommentSection({ onTotalChange }) {
  const { id: lessonId } = useParams();
  const { isLoggedIn, firebaseUser, userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 10;

  // Get user info for avatar
  const providerPhotoURL = firebaseUser?.photoURL || firebaseUser?.providerData?.find((p) => p?.photoURL)?.photoURL;
  const userName = userProfile?.name || firebaseUser?.displayName || 'User';
  const userPhotoURL = userProfile?.photoURL || providerPhotoURL;
  const avatarFallback = `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(userName)}`;
  const avatarUrl = userPhotoURL || avatarFallback;

  // Fetch comments
  const fetchComments = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/lessons/${lessonId}/comments`, {
        params: { page: pageNum, limit: LIMIT },
      });

      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }

      setTotal(data.total);
      setPage(pageNum);
      setHasMore(pageNum < data.pages);
      
      // Notify parent component of total change
      if (onTotalChange) {
        onTotalChange(data.total);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [lessonId, onTotalChange]);

  useEffect(() => {
    if (lessonId) {
      fetchComments(1);
    }
  }, [lessonId, fetchComments]);

  // Post new comment
  const handlePostComment = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please log in to comment');
      return;
    }

    const trimmedComment = newComment.trim();
    
    if (!trimmedComment) {
      toast.error('Comment cannot be empty');
      return;
    }

    // Sanitize input on frontend (additional security layer)
    const sanitizedContent = DOMPurify.sanitize(trimmedComment, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    if (sanitizedContent.length > 2000) {
      toast.error('Comment is too long (max 2000 characters)');
      return;
    }

    try {
      setPosting(true);
      const { data } = await apiClient.post(`/lessons/${lessonId}/comments`, {
        content: sanitizedContent,
      });

      setComments([data, ...comments]);
      setNewComment('');
      const newTotal = total + 1;
      setTotal(newTotal);
      
      // Notify parent component of total change
      if (onTotalChange) {
        onTotalChange(newTotal);
      }
      
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // Handle comment update
  const handleUpdateComment = (commentId, updatedComment) => {
    setComments(
      comments.map((c) => (c._id === commentId ? updatedComment : c))
    );
    toast.success('Comment updated');
  };

  // Handle comment delete
  const handleDeleteComment = (commentId) => {
    const deletedComment = comments.find((c) => c._id === commentId);
    const replyCount = deletedComment ? countAllReplies(deletedComment.replies) : 0;
    
    setComments(comments.filter((c) => c._id !== commentId));
    const newTotal = total - 1 - replyCount; // Subtract comment + all its replies
    setTotal(newTotal);
    
    // Notify parent component of total change
    if (onTotalChange) {
      onTotalChange(newTotal);
    }
    
    toast.success('Comment deleted');
  };

  // Handle reply added
  const handleReplyAdded = (commentId, updatedComment) => {
    const oldComment = comments.find((c) => c._id === commentId);
    const oldReplyCount = oldComment ? countAllReplies(oldComment.replies) : 0;
    const newReplyCount = updatedComment ? countAllReplies(updatedComment.replies) : 0;
    const replyDiff = newReplyCount - oldReplyCount;
    
    setComments(
      comments.map((c) => (c._id === commentId ? updatedComment : c))
    );
    
    if (replyDiff !== 0) {
      const newTotal = total + replyDiff;
      setTotal(newTotal);
      
      // Notify parent component of total change
      if (onTotalChange) {
        onTotalChange(newTotal);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment input */}
      {isLoggedIn ? (
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <form onSubmit={handlePostComment}>
            <div className="flex gap-3 p-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-cherry-100"
                  onError={(e) => {
                    e.target.src = avatarFallback;
                  }}
                />
              </div>
              
              {/* Comment Input Area */}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent resize-none text-text-primary placeholder:text-text-muted transition-all"
                  disabled={posting}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 px-4 pb-4 pt-0">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-5 py-2.5 text-text-secondary bg-gray-50 rounded-xl hover:bg-gray-100 transition-all font-medium"
                disabled={posting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="px-5 py-2.5 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {posting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-cherry-50 border border-cherry-200 rounded-2xl p-6 text-center">
          <p className="text-text-primary">
            <a href="/login" className="text-cherry font-semibold hover:text-cherry-dark underline decoration-2 underline-offset-2 transition-colors">
              Log in
            </a>{' '}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {total > 0 && (
          <div className="text-sm font-medium text-text-muted">
            {total} {total === 1 ? 'comment' : 'comments'}
          </div>
        )}

        {loading && page === 1 ? (
          <Loading />
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                lessonId={lessonId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onReplyAdded={handleReplyAdded}
              />
            ))}

            {hasMore && (
              <button
                onClick={() => fetchComments(page + 1)}
                disabled={loading}
                className="w-full py-3 text-cherry font-medium hover:bg-cherry-50 rounded-xl transition-all disabled:opacity-50 border border-cherry-200"
              >
                {loading ? 'Loading...' : 'Load more comments'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
