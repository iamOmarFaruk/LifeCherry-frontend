import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiFlag, FiClock, FiCheck, FiX, FiAlertCircle, FiEye } from 'react-icons/fi';
import { reportAPI } from '../utils/apiClient';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';

const MyReports = () => {
  useDocumentTitle('My Reports - LifeCherry');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await reportAPI.getUserReports(params);
      setReports(data.reports || []);
      
      // Calculate stats
      const statusCounts = (data.reports || []).reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});
      setStats(statusCounts);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleWithdraw = async (reportId, lessonTitle) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Withdraw Report?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to withdraw your report for "{lessonTitle}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
              }}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await reportAPI.withdrawReport(reportId);
                  toast.success('Report withdrawn successfully', {
                    icon: '✓',
                    style: {
                      background: '#10B981',
                      color: '#fff',
                    },
                  });
                  fetchReports();
                } catch (error) {
                  console.error('Error withdrawing report:', error);
                  toast.error(error.response?.data?.message || 'Failed to withdraw report');
                }
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 font-semibold transition-all text-sm"
            >
              Withdraw
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#fff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '420px',
        },
      }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'reviewing':
        return <FiEye className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <FiX className="w-5 h-5 text-red-600" />;
      case 'withdrawn':
        return <FiAlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      'inappropriate-content': 'Inappropriate Content',
      'spam': 'Spam',
      'misinformation': 'Misinformation',
      'copyright': 'Copyright Violation',
      'harassment': 'Harassment',
      'other': 'Other',
    };
    return labels[reason] || reason;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const filters = [
    { value: 'all', label: 'All Reports', count: reports.length },
    { value: 'pending', label: 'Pending', count: stats.pending || 0 },
    { value: 'reviewing', label: 'Under Review', count: stats.reviewing || 0 },
    { value: 'resolved', label: 'Resolved', count: stats.resolved || 0 },
    { value: 'rejected', label: 'Rejected', count: stats.rejected || 0 },
    { value: 'withdrawn', label: 'Withdrawn', count: stats.withdrawn || 0 },
  ];

  if (loading) {
    return (
      <PageLoader>
        <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white flex items-center justify-center">
          Loading reports...
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="min-h-screen bg-gradient-to-b from-cherry-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-cherry mb-2 flex items-center gap-3">
              <FiFlag className="w-10 h-10" />
              My Reports
            </h1>
            <p className="text-gray-600">View and manage your reported lessons</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === f.value
                      ? 'bg-gradient-to-r from-cherry to-cherry-dark text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label} {f.count > 0 && `(${f.count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FiFlag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No reports found</h3>
              <p className="text-gray-500">
                {filter !== 'all'
                  ? `You don't have any ${filter} reports`
                  : "You haven't reported any lessons yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/lessons/${report.lessonId?._id}`}
                        className="group"
                      >
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-cherry transition-colors mb-2">
                          {report.lessonId?.title || 'Lesson removed'}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          <span className={`px-3 py-1 rounded-full font-semibold border ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{getReasonLabel(report.reason)}</span>
                        <span>•</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                    {(report.status === 'pending' || report.status === 'reviewing') && (
                      <button
                        onClick={() => handleWithdraw(report._id, report.lessonId?.title || 'this lesson')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-semibold transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Your report:</p>
                    <p className="text-gray-600">{report.description}</p>
                  </div>

                  {report.adminMessage && (
                    <div className="bg-cherry-50 border-l-4 border-cherry rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-cherry">
                          Admin Response by {report.reviewerName}:
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(report.reviewedAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{report.adminMessage}</p>
                    </div>
                  )}

                  {report.lessonId && (
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        to={`/lessons/${report.lessonId._id}`}
                        className="text-cherry hover:text-cherry-dark font-semibold text-sm flex items-center gap-1"
                      >
                        View Lesson →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLoader>
  );
};

export default MyReports;
