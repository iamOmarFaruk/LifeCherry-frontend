import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { reportAPI } from '../../utils/apiClient';
import DOMPurify from 'dompurify';

const ReportModal = ({ lessonId, lessonTitle, onClose, onReported }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'inappropriate-content', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'harassment', label: 'Harassment or Hate Speech' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (description.length > 500) {
      toast.error('Description is too long (max 500 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedDescription = DOMPurify.sanitize(description.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      await reportAPI.createReport(lessonId, {
        reason,
        description: sanitizedDescription,
      });

      toast.success('Report submitted successfully');
      onReported?.();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cherry">Report Lesson</h2>
            <p className="text-sm text-gray-600 mt-1">{lessonTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cherry transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason <span className="text-cherry">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-cherry-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all"
              required
            >
              <option value="">Select a reason</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-cherry">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about why you're reporting this lesson..."
              className="w-full px-4 py-3 border-2 border-cherry-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cherry focus:border-transparent transition-all resize-none"
              rows="4"
              maxLength="500"
              required
            />
            <div className="text-xs text-right mt-1 text-gray-500">
              {description.length}/500
            </div>
          </div>

          <div className="bg-cherry-50 border-l-4 border-cherry p-3 rounded">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can only report a lesson once. Our team will review your report and take appropriate action.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cherry to-cherry-dark text-white rounded-xl hover:shadow-lg hover:scale-105 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
