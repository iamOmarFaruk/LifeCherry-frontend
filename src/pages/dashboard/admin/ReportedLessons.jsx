// Reported Lessons Page - LifeCherry Admin
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineFlag,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineTrash
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import DashboardPageHeader from '../../../components/shared/DashboardPageHeader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient, { reportAPI } from '../../../utils/apiClient';
import { reportReasons } from '../../../data/reports';
import { users } from '../../../data/users';

import useAuth from '../../../hooks/useAuth';

const ReportedLessons = () => {
  useDocumentTitle('Reported Lessons');
  const { authLoading } = useAuth();

  // State
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  const ITEMS_PER_PAGE = 10;

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const { data } = await reportAPI.getAllReports(params);
      setReportsData(data.reports || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, authLoading]);

  const handleReviewReport = async (status) => {
    if (!selectedReport) return;

    try {
      setIsSubmitting(true);
      await reportAPI.reviewReport(selectedReport._id, {
        status,
        adminMessage: adminMessage.trim() || undefined,
      });
      toast.success(`Report ${status} successfully`);
      setShowDetailsModal(false);
      setSelectedReport(null);
      setAdminMessage('');
      setReviewStatus('');
      fetchReports();
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast.error(error.response?.data?.message || 'Failed to review report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group reports by lesson
  const reportedLessons = useMemo(() => {
    const lessonReports = {};

    reportsData.forEach(report => {
      const lessonId = report.lessonId?._id || report.lessonId;
      if (!lessonReports[lessonId]) {
        lessonReports[lessonId] = {
          lesson: report.lessonId,
          reports: [],
          reportCount: 0,
          latestReport: null
        };
      }
      lessonReports[lessonId].reports.push(report);
      lessonReports[lessonId].reportCount++;
      if (!lessonReports[lessonId].latestReport ||
        new Date(report.createdAt) > new Date(lessonReports[lessonId].latestReport.createdAt)) {
        lessonReports[lessonId].latestReport = report;
      }
    });

    return Object.values(lessonReports);
  }, [reportsData]);

  // Filter reported lessons
  const filteredReportedLessons = useMemo(() => {
    let result = [...reportedLessons].filter(item => item.lesson);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.lesson?.title?.toLowerCase().includes(query) ||
        item.lesson?.creatorName?.toLowerCase().includes(query)
      );
    }

    // Sort by report count (most reported first)
    result.sort((a, b) => b.reportCount - a.reportCount);

    return result;
  }, [reportedLessons, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReportedLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = filteredReportedLessons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get reporter info
  const getReporterInfo = (email, reportContext) => {
    // Try to find in real users list if available, or dummy users
    const user = users.find(u => u.email === email);
    if (user) return user;

    // Fallback to report context or placeholder
    return {
      name: reportContext?.reporterName || email,
      photoURL: user?.photoURL || 'https://via.placeholder.com/40',
      email: email
    };
  };

  // Get reason label
  const getReasonLabel = (reasonValue) => {
    // Backend values are lowercase/kebab-case
    const reasonMap = {
      'inappropriate-content': 'Inappropriate Content',
      'hate-speech': 'Hate Speech or Harassment',
      'harassment': 'Hate Speech or Harassment',
      'misinformation': 'Misleading or False Information',
      'spam': 'Spam or Promotional Content',
      'sensitive': 'Sensitive or Disturbing Content',
      'copyright': 'Copyright Infringement',
      'other': 'Other'
    };

    if (reasonMap[reasonValue]) return reasonMap[reasonValue];

    // Fallback for dummy data or matching strings
    return reasonValue;
  };

  // Handle ignore report (dismiss)
  // Handle ignore report (dismiss)
  const handleIgnoreReports = async (lessonId) => {
    if (!selectedLesson || !selectedLesson.reports) return;

    // Find all pending reports for this lesson
    const pendingReports = selectedLesson.reports.filter(r => r.status === 'pending');

    if (pendingReports.length === 0) {
      toast.success('No pending reports to dismiss');
      return;
    }

    setIsSubmitting(true);
    try {
      // Resolve all pending reports
      await Promise.all(pendingReports.map(report =>
        reportAPI.reviewReport(report._id, { status: 'resolved', adminMessage: 'Batch resolved by admin' })
      ));

      toast.success('Reports dismissed successfully');
      setShowDetailsModal(false);
      setSelectedLesson(null);
      fetchReports(); // Refresh data
    } catch (error) {
      console.error('Error dismissing reports:', error);
      toast.error('Failed to dismiss reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async () => {
    if (!selectedLesson || !selectedLesson.lesson) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/lessons/${selectedLesson.lesson._id}`);

      toast.success('Lesson deleted successfully');
      setShowDeleteModal(false);
      setShowDetailsModal(false);
      setSelectedLesson(null);

      // Refresh reports which will now exclude reports for deleted lesson
      fetchReports();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats display
  const statsDisplay = {
    total: reportedLessons.length,
    pending: stats.pending || 0,
    resolved: stats.resolved || 0,
    totalReports: reportsData.length
  };

  if (loading) {
    return (
      <PageLoader>
        <div className="flex items-center justify-center h-64">
          <div className="text-cherry">Loading reports...</div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Page Header */}
        <DashboardPageHeader
          icon={HiOutlineFlag}
          title="Reported Lessons"
          description="Review and manage community-reported content"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{statsDisplay.total}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Reported Lessons</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{statsDisplay.pending}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{statsDisplay.resolved}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <HiOutlineInformationCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text dark:text-white">{statsDisplay.totalReports}</p>
                <p className="text-xs text-text-secondary dark:text-gray-400">Total Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by lesson title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-text dark:text-white placeholder:text-gray-400 focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterStatus === 'all'
                  ? 'bg-cherry text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterStatus === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Reported Lessons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-border dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Latest Report
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {paginatedLessons.map((item) => (
                  <tr key={item.lesson?._id || item.reports[0]?._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.lesson?.image ? (
                          <img
                            src={item.lesson.image}
                            alt={item.lesson.title || 'Lesson'}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <HiOutlineBookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <h4 className="font-medium text-text dark:text-white truncate">{item.lesson?.title || 'Untitled Lesson'}</h4>
                          <span className="text-xs bg-cherry-50 dark:bg-cherry/20 text-cherry px-2 py-0.5 rounded-full">
                            {item.lesson?.category || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.lesson?.creatorPhoto ? (
                          <img
                            src={item.lesson.creatorPhoto}
                            alt={item.lesson.creatorName || 'Creator'}
                            className="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=?'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text dark:text-white">{item.lesson?.creatorName || 'Unknown'}</p>
                          <p className="text-xs text-text-secondary dark:text-gray-400">{item.lesson?.creatorEmail || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${item.reportCount >= 5
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : item.reportCount >= 3
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                          <HiOutlineFlag className="w-4 h-4" />
                          {item.reportCount}
                        </span>
                        {item.reports.some(r => r.status === 'pending') && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.latestReport && (
                        <div>
                          <p className="text-sm text-text dark:text-white font-medium">
                            {getReasonLabel(item.latestReport.reason)}
                          </p>
                          <p className="text-xs text-text-secondary dark:text-gray-400">
                            {formatDate(item.latestReport.createdAt)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedLesson(item);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/lessons/${item.lesson?._id}`}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Lesson"
                        >
                          <HiOutlineBookOpen className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedLesson(item);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Lesson"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedLessons.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text dark:text-white mb-2">No reported lessons</h3>
              <p className="text-text-secondary dark:text-gray-400">
                {filterStatus === 'pending'
                  ? 'All reports have been reviewed!'
                  : 'No lessons match your search criteria'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReportedLessons.length)} of {filteredReportedLessons.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text dark:text-white"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                      ? 'bg-cherry text-white'
                      : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-text dark:text-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text dark:text-white"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-border dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {selectedLesson.lesson?.image ? (
                      <img
                        src={selectedLesson.lesson.image}
                        alt={selectedLesson.lesson.title || 'Lesson'}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <HiOutlineBookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-text dark:text-white">{selectedLesson.lesson?.title || 'Untitled Lesson'}</h3>
                      <p className="text-sm text-text-secondary dark:text-gray-400">by {selectedLesson.lesson?.creatorName || 'Unknown'}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full mt-1">
                        <HiOutlineFlag className="w-3 h-3" />
                        {selectedLesson.reportCount} {selectedLesson.reportCount === 1 ? 'Report' : 'Reports'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLesson(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-text dark:text-white"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reports List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-text dark:text-white mb-4">All Reports</h4>
                <div className="space-y-4">
                  {selectedLesson.reports.map((report) => {
                    const reporter = getReporterInfo(report.reporterEmail, report);
                    return (
                      <div key={report._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={reporter.photoURL}
                              alt={report.reporterName || reporter.name}
                              className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=?'; }}
                            />
                            <div>
                              <p className="font-medium text-text dark:text-white text-sm">{report.reporterName || reporter.name}</p>
                              <p className="text-xs text-text-secondary dark:text-gray-400">{report.reporterEmail}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${report.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{getReasonLabel(report.reason)}</p>
                          {report.description && (
                            <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">{report.description}</p>
                          )}
                          <p className="text-xs text-text-muted dark:text-gray-500">
                            Reported on {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleIgnoreReports(selectedLesson.lesson?._id)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Ignore Reports
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                    Delete Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-white">Delete Lesson</h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  {selectedLesson.lesson?.image ? (
                    <img
                      src={selectedLesson.lesson.image}
                      alt={selectedLesson.lesson.title || 'Lesson'}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <HiOutlineBookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-text dark:text-white line-clamp-1">{selectedLesson.lesson?.title || 'Untitled Lesson'}</h4>
                    <p className="text-sm text-text-secondary dark:text-gray-400">by {selectedLesson.lesson?.creatorName || 'Unknown'}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{selectedLesson.reportCount} reports</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary dark:text-gray-400 mb-6">
                Are you sure you want to delete this lesson? All associated reports will also be removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLesson}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Lesson'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
};

export default ReportedLessons;
