import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import ReactionBar from './ReactionBar';
import ReplyCard from './ReplyCard';



export default function CommentCard({ comment, lessonId, onUpdate, onDelete, onReplyAdded }) {
  const { isLoggedIn, firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = firebaseUser?.email === comment.userEmail;
  const userReaction = comment.reactions?.find((r) => r.userEmail === firebaseUser?.email);

  // Handle comment update
  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.patch(`/comments/${comment._id}`, {
        content: editedContent,
      });
      onUpdate(comment._id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment delete
  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await apiClient.delete(`/comments/${comment._id}`);
      onDelete(comment._id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Handle reaction
  const handleReaction = async (emoji) => {
    if (!isLoggedIn) {
      toast.error('Please log in to react');
      return;
    }

    try {
      const { data } = await apiClient.post(`/comments/${comment._id}/reactions`, {
        emoji,
      });
      onUpdate(comment._id, data);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Handle reply
  const handleReply = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please log in to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.post(`/comments/${comment._id}/replies`, {
        content: replyContent,
      });
      onReplyAdded(comment._id, data.comment);
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Comment header */}
      <div className="flex items-start gap-3">
        <img
          src={comment.userPhoto || `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(comment.userName)}`}
          alt={comment.userName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(comment.userName)}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">{comment.userName}</p>
                {comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() + 5000 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">edited</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedContent(comment.content);
                  }}
                  className="text-xs px-3 py-1.5 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/30 rounded-lg font-medium transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-3 py-1.5 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/30 rounded-lg font-medium transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-4 py-3 border-2 border-cherry-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent text-sm resize-none transition-all shadow-sm"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="text-sm px-4 py-2 bg-gradient-to-r from-cherry to-cherry-dark text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{comment.content}</p>
      )}

      {/* Reactions and actions - Modern Minimal Style */}
      <div className="flex items-center gap-4 flex-wrap">
        <ReactionBar
          reactions={comment.reactions}
          userReaction={userReaction}
          onReact={handleReaction}
        />

        {/* Separator */}
        <span className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Reply button */}
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cherry dark:hover:text-cherry hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="hidden sm:inline">Reply</span>
        </button>

        {/* Replies count */}
        {comment.replies && comment.replies.length > 0 && (
          <>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium text-cherry hover:text-cherry-dark hover:bg-cherry-50 dark:hover:bg-cherry-900/30 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {comment.replies.length}
              <span className="hidden sm:inline">{comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showReplies ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="ml-10 mt-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent text-sm resize-none transition-all shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="text-sm px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="text-sm px-4 py-2 bg-gradient-to-r from-cherry to-cherry-dark text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-3 border-l-2 border-cherry-200 dark:border-cherry-800 pl-4">
          {comment.replies.map((reply) => (
            <ReplyCard
              key={reply._id}
              reply={reply}
              parentCommentId={comment._id}
              lessonId={lessonId}
              level={1}
              onUpdate={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
