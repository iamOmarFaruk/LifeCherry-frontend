import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function ReplyCard({ reply, parentCommentId, lessonId, level, onUpdate }) {
  const { isLoggedIn, firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(reply.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNestedReplies, setShowNestedReplies] = useState(false);

  const isOwner = firebaseUser?.email === reply.userEmail;
  const userReaction = reply.reactions?.find((r) => r.userEmail === firebaseUser?.email);

  // Build API endpoint based on level
  const getUpdateEndpoint = () => {
    if (level === 1) {
      return `/comments/${parentCommentId}/replies/${reply._id}`;
    } else if (level === 2) {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply._id}`;
    } else {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply.parentNestedReplyId}/replies/${reply._id}`;
    }
  };

  const getReactionEndpoint = () => {
    if (level === 1) {
      return `/comments/${parentCommentId}/replies/${reply._id}/reactions`;
    } else if (level === 2) {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply._id}/reactions`;
    } else {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply.parentNestedReplyId}/replies/${reply._id}/reactions`;
    }
  };

  const getNestedReplyEndpoint = () => {
    if (level === 1) {
      return `/comments/${parentCommentId}/replies/${reply._id}/replies`;
    } else {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply._id}/replies`;
    }
  };

  const getDeleteEndpoint = () => {
    if (level === 1) {
      return `/comments/${parentCommentId}/replies/${reply._id}`;
    } else if (level === 2) {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply._id}`;
    } else {
      return `/comments/${parentCommentId}/replies/${reply.parentReplyId}/replies/${reply.parentNestedReplyId}/replies/${reply._id}`;
    }
  };

  // Handle reply update
  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.patch(getUpdateEndpoint(), {
        content: editedContent,
      });
      onUpdate(parentCommentId, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply delete
  const handleDelete = async () => {
    if (!window.confirm('Delete this reply?')) return;

    try {
      const { data } = await apiClient.delete(getDeleteEndpoint());
      onUpdate(parentCommentId, data.comment);
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  // Handle reaction
  const handleReaction = async (emoji) => {
    if (!isLoggedIn) {
      toast.error('Please log in to react');
      return;
    }

    try {
      const { data } = await apiClient.post(getReactionEndpoint(), { emoji });
      onUpdate(parentCommentId, data);
      setShowReactions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Handle nested reply (only for level 1 and 2)
  const handleNestedReply = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please log in to reply');
      return;
    }

    if (level === 3) {
      toast.error('Maximum reply depth reached');
      return;
    }

    if (!nestedReplyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await apiClient.post(getNestedReplyEndpoint(), {
        content: nestedReplyContent,
      });
      onUpdate(parentCommentId, data.comment);
      setNestedReplyContent('');
      setShowReplyForm(false);
      setShowNestedReplies(true);
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
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
      {/* Reply header */}
      <div className="flex items-start gap-2">
        <img
          src={reply.userPhoto || `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(reply.userName)}`}
          alt={reply.userName}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(reply.userName)}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{reply.userName}</p>
              <p className="text-xs text-gray-500">{formatDate(reply.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedContent(reply.content);
                  }}
                  className="text-xs px-2 py-1 text-cherry hover:bg-cherry-50 rounded-lg font-medium transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 border-2 border-cherry-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all shadow-sm"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-3 py-1.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="text-xs px-3 py-1.5 bg-gradient-to-r from-cherry to-cherry-dark text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm leading-relaxed">{reply.content}</p>
      )}

      {/* Reactions and actions */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        {/* Reaction summary */}
        {reply.reactions && reply.reactions.length > 0 && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-cherry-50 to-pink-50 border border-cherry-100 rounded-full px-2 py-1 shadow-sm">
            {Array.from(
              new Set(reply.reactions.map((r) => r.emoji))
            ).map((emoji) => {
              const count = reply.reactions.filter((r) => r.emoji === emoji).length;
              return (
                <span
                  key={emoji}
                  className="flex items-center gap-0.5 text-sm cursor-pointer hover:scale-125 transition-transform duration-200"
                  title={reply.reactions
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
            className="text-sm text-gray-600 hover:text-cherry hover:bg-cherry-50 px-2 py-1 rounded-lg transition-all font-medium border border-transparent hover:border-cherry-200"
          >
            {userReaction ? userReaction.emoji : '👍'}
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-cherry-100 rounded-2xl shadow-2xl p-2 flex gap-1.5 z-10">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform duration-200 cursor-pointer p-1 hover:bg-cherry-50 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply button (only for level 1 and 2) */}
        {level < 3 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-gray-600 hover:text-cherry hover:bg-cherry-50 px-2 py-1 rounded-lg transition-all font-medium border border-transparent hover:border-cherry-200"
          >
            Reply
          </button>
        )}

        {/* Nested replies count */}
        {reply.replies && reply.replies.length > 0 && (
          <button
            onClick={() => setShowNestedReplies(!showNestedReplies)}
            className="text-sm text-cherry hover:text-cherry-dark font-semibold transition-colors"
          >
            {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Nested reply form */}
      {showReplyForm && level < 3 && (
        <form onSubmit={handleNestedReply} className="mt-2 space-y-2 border-t border-cherry-200 pt-2">
          <textarea
            value={nestedReplyContent}
            onChange={(e) => setNestedReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="1"
            className="w-full px-3 py-2 border-2 border-cherry-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all shadow-sm"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setNestedReplyContent('');
              }}
              className="text-xs px-3 py-1.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !nestedReplyContent.trim()}
              className="text-xs px-3 py-1.5 bg-gradient-to-r from-cherry to-cherry-dark text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Nested replies */}
      {showNestedReplies && reply.replies && reply.replies.length > 0 && (
        <div className="mt-2 space-y-2 border-t border-cherry-200 pt-2">
          {reply.replies.map((nestedReply) => (
            <ReplyCard
              key={nestedReply._id}
              reply={{
                ...nestedReply,
                parentReplyId: reply._id,
                parentNestedReplyId: level === 2 ? reply._id : undefined,
              }}
              parentCommentId={parentCommentId}
              lessonId={lessonId}
              level={level + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
