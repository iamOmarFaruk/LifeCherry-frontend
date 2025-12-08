import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
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
          src={comment.userPhoto || '/default-avatar.png'}
          alt={comment.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{comment.userName}</p>
              <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedContent(comment.content);
                  }}
                  className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
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
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-3 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm">{comment.content}</p>
      )}

      {/* Reactions and actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Reaction summary */}
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
            {Array.from(
              new Set(comment.reactions.map((r) => r.emoji))
            ).map((emoji) => {
              const count = comment.reactions.filter((r) => r.emoji === emoji).length;
              return (
                <span
                  key={emoji}
                  className="text-sm cursor-pointer hover:scale-110 transition"
                  title={comment.reactions
                    .filter((r) => r.emoji === emoji)
                    .map((r) => r.userEmail.split('@')[0])
                    .join(', ')}
                >
                  {emoji} {count > 1 ? count : ''}
                </span>
              );
            })}
          </div>
        )}

        {/* Reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition"
          >
            {userReaction ? userReaction.emoji : '👍'}
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transition cursor-pointer"
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
          className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition"
        >
          Reply
        </button>

        {/* Replies count */}
        {comment.replies && comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="ml-10 mt-4 space-y-2 border-l-2 border-gray-200 pl-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="text-sm px-3 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
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
