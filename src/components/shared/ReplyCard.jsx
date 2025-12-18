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
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3 space-y-2">
      {/* Reply header */}
      <div className="flex items-start gap-2">
        <img
          src={reply.userPhoto || `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(reply.userName)}`}
          alt={reply.userName}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-600"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(reply.userName)}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{reply.userName}</p>
                {reply.updatedAt && new Date(reply.updatedAt).getTime() > new Date(reply.createdAt).getTime() + 5000 && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">edited</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedContent(reply.content);
                  }}
                  className="text-xs px-2 py-1 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/30 rounded-lg font-medium transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/30 rounded-lg font-medium transition-all"
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
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all shadow-sm"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 font-medium transition-all"
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
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{reply.content}</p>
      )}

      {/* Reactions and actions - Modern Minimal Style */}
      <div className="flex items-center gap-1 flex-wrap text-xs">
        {/* Inline reaction summary */}
        {reply.reactions && reply.reactions.length > 0 && (
          <div className="flex items-center -space-x-1 mr-1.5">
            {Array.from(
              new Set(reply.reactions.map((r) => r.emoji))
            ).slice(0, 3).map((emoji, index) => {
              const count = reply.reactions.filter((r) => r.emoji === emoji).length;
              const isUserReaction = userReaction?.emoji === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full text-xs transition-all duration-200 hover:scale-110 hover:z-10 ${isUserReaction
                      ? 'bg-cherry-100 dark:bg-cherry-900/50 ring-2 ring-cherry-300 dark:ring-cherry-700'
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  style={{ zIndex: 3 - index }}
                  title={reply.reactions
                    .filter((r) => r.emoji === emoji)
                    .map((r) => r.userEmail.split('@')[0])
                    .join(', ')}
                >
                  {emoji}
                  {count > 1 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-cherry text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Reaction picker trigger */}
        <div className="relative group">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${userReaction
                ? 'text-cherry bg-cherry-50 dark:bg-cherry-900/30 hover:bg-cherry-100 dark:hover:bg-cherry-900/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
          >
            <span className="text-sm transition-transform duration-200 group-hover:scale-110">
              {userReaction ? userReaction.emoji : '☺'}
            </span>
          </button>

          {/* Floating emoji picker */}
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 z-20">
              <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-600 px-1.5 py-1">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`w-7 h-7 flex items-center justify-center text-base rounded-full transition-all duration-150 hover:scale-125 hover:bg-gray-100 dark:hover:bg-gray-700 ${userReaction?.emoji === emoji ? 'bg-cherry-50 dark:bg-cherry-900/30 scale-110' : ''
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reply button (only for level 1 and 2) */}
        {level < 3 && (
          <>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-500 mx-0.5" />
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-cherry dark:hover:text-cherry hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          </>
        )}

        {/* Nested replies count */}
        {reply.replies && reply.replies.length > 0 && (
          <>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-500 mx-0.5" />
            <button
              onClick={() => setShowNestedReplies(!showNestedReplies)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-cherry hover:text-cherry-dark hover:bg-cherry-50 dark:hover:bg-cherry-900/30 transition-all duration-200"
            >
              {reply.replies.length}
              <span>{reply.replies.length === 1 ? 'reply' : 'replies'}</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showNestedReplies ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Nested reply form */}
      {showReplyForm && level < 3 && (
        <form onSubmit={handleNestedReply} className="mt-2 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-2">
          <textarea
            value={nestedReplyContent}
            onChange={(e) => setNestedReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="1"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setNestedReplyContent('');
              }}
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 font-medium transition-all"
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
        <div className="mt-2 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-2">
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
