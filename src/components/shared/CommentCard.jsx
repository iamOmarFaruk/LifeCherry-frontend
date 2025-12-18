import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import ReplyCard from './ReplyCard';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function CommentCard({ comment, lessonId, onUpdate, onDelete, onReplyAdded }) {
  const { isLoggedIn, firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReactions, setShowReactions] = useState(false);
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
      setShowReactions(false);
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
      toast.success('Reply posted!');
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Comment header */}
      <div className="flex items-start gap-3">
        <img
          src={comment.userPhoto || `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(comment.userName)}`}
          alt={comment.userName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(comment.userName)}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{comment.userName}</p>
                {comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() + 5000 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">edited</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedContent(comment.content);
                  }}
                  className="text-xs px-3 py-1.5 text-cherry hover:bg-cherry-50 rounded-lg font-medium transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-3 py-1.5 text-cherry hover:bg-cherry-50 rounded-lg font-medium transition-all"
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
            className="w-full px-4 py-3 border-2 border-cherry-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent text-sm resize-none transition-all shadow-sm"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm px-4 py-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium transition-all"
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
        <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
      )}

      {/* Reactions and actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Reaction summary */}
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-cherry-50 to-pink-50 border border-cherry-100 rounded-full px-3 py-1.5 shadow-sm">
            {Array.from(
              new Set(comment.reactions.map((r) => r.emoji))
            ).map((emoji) => {
              const count = comment.reactions.filter((r) => r.emoji === emoji).length;
              return (
                <span
                  key={emoji}
                  className="flex items-center gap-0.5 text-base cursor-pointer hover:scale-125 transition-transform duration-200"
                  title={comment.reactions
                    .filter((r) => r.emoji === emoji)
                    .map((r) => r.userEmail.split('@')[0])
                    .join(', ')}
                >
                  {emoji} {count > 1 && <span className="text-xs font-semibold text-cherry-600">{count}</span>}
                </span>
              );
            })}
          </div>
        )}

        {/* Reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-base text-gray-600 hover:text-cherry hover:bg-cherry-50 px-3 py-1.5 rounded-lg transition-all font-medium border border-transparent hover:border-cherry-200"
          >
            {userReaction ? userReaction.emoji : '👍'}
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-cherry-100 rounded-2xl shadow-2xl p-3 flex gap-2 z-10 backdrop-blur-sm">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform duration-200 cursor-pointer p-1.5 hover:bg-cherry-50 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply button */}
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm text-gray-600 hover:text-cherry hover:bg-cherry-50 px-3 py-1.5 rounded-lg transition-all font-medium border border-transparent hover:border-cherry-200"
        >
          Reply
        </button>

        {/* Replies count */}
        {comment.replies && comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-cherry hover:text-cherry-dark font-semibold transition-colors"
          >
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="ml-10 mt-4 space-y-3 border-l-2 border-cherry-200 pl-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full px-4 py-3 border-2 border-cherry-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent text-sm resize-none transition-all shadow-sm"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="text-sm px-4 py-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium transition-all"
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
        <div className="ml-8 mt-4 space-y-3 border-l-2 border-cherry-200 pl-4">
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
