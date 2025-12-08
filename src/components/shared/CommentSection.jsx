import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';
import CommentCard from './CommentCard';
import Loading from './Loading';

export default function CommentSection() {
  const { id: lessonId } = useParams();
  const { isLoggedIn } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 10;

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
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

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

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setPosting(true);
      const { data } = await apiClient.post(`/lessons/${lessonId}/comments`, {
        content: newComment,
      });

      setComments([data, ...comments]);
      setNewComment('');
      setTotal(total + 1);
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
    setComments(comments.filter((c) => c._id !== commentId));
    setTotal(total - 1);
    toast.success('Comment deleted');
  };

  // Handle reply added
  const handleReplyAdded = (commentId, updatedComment) => {
    setComments(
      comments.map((c) => (c._id === commentId ? updatedComment : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment input */}
      {isLoggedIn ? (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <form onSubmit={handlePostComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={posting}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={posting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-gray-700">
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </a>{' '}
            to share your thoughts
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {total > 0 ? `${total} ${total === 1 ? 'comment' : 'comments'}` : 'No comments yet'}
        </div>

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
                className="w-full py-2 text-blue-600 hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
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
