// Reported Lessons Page - LifeCherry Admin
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineFlag,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineClock
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { lessons } from '../../../data/lessons';
import { reports, reportReasons } from '../../../data/reports';
import { users } from '../../../data/users';

const ReportedLessons = () => {
  useDocumentTitle('Reported Lessons');
  
  // State
  const [reportsData, setReportsData] = useState(reports);
  const [lessonsData, setLessonsData] = useState(lessons);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Group reports by lesson
  const reportedLessons = useMemo(() => {
    const lessonReports = {};
    
    reportsData.forEach(report => {
      if (!lessonReports[report.lessonId]) {
        const lesson = lessonsData.find(l => l._id === report.lessonId);
        if (lesson) {
          lessonReports[report.lessonId] = {
            lesson,
            reports: [],
            reportCount: 0,
            latestReport: null
          };
        }
      }
      if (lessonReports[report.lessonId]) {
        lessonReports[report.lessonId].reports.push(report);
        lessonReports[report.lessonId].reportCount++;
        if (!lessonReports[report.lessonId].latestReport || 
            new Date(report.createdAt) > new Date(lessonReports[report.lessonId].latestReport.createdAt)) {
          lessonReports[report.lessonId].latestReport = report;
        }
      }
    });

    return Object.values(lessonReports);
  }, [reportsData, lessonsData]);

  // Filter reported lessons
  const filteredReportedLessons = useMemo(() => {
    let result = [...reportedLessons];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.lesson.title.toLowerCase().includes(query) ||
        item.lesson.creatorName.toLowerCase().includes(query)
      );
    }

    if (filterStatus === 'pending') {
      result = result.filter(item => 
        item.reports.some(r => r.status === 'pending')
      );
    } else if (filterStatus === 'resolved') {
      result = result.filter(item => 
        item.reports.every(r => r.status === 'resolved')
      );
    }

    // Sort by report count (most reported first)
    result.sort((a, b) => b.reportCount - a.reportCount);

    return result;
  }, [reportedLessons, searchQuery, filterStatus]);

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
  const getReporterInfo = (email) => {
    const user = users.find(u => u.email === email);
    return user || { name: email, photoURL: 'https://via.placeholder.com/40' };
  };

  // Get reason label
  const getReasonLabel = (reasonValue) => {
    const reason = reportReasons.find(r => r.value === reasonValue);
    return reason ? reason.label : reasonValue;
  };

  // Handle ignore report (dismiss)
  const handleIgnoreReports = (lessonId) => {
    setReportsData(prev => prev.map(r => 
      r.lessonId === lessonId ? { ...r, status: 'resolved' } : r
    ));
    toast.success('Reports dismissed');
    setShowDetailsModal(false);
    setSelectedLesson(null);
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLessonsData(prev => prev.filter(l => l._id !== selectedLesson.lesson._id));
      setReportsData(prev => prev.filter(r => r.lessonId !== selectedLesson.lesson._id));
      toast.success('Lesson deleted and reports resolved');
      setShowDeleteModal(false);
      setShowDetailsModal(false);
      setSelectedLesson(null);
      setIsSubmitting(false);
    }, 1000);
  };

  // Stats
  const stats = {
    total: reportedLessons.length,
    pending: reportedLessons.filter(item => item.reports.some(r => r.status === 'pending')).length,
    resolved: reportedLessons.filter(item => item.reports.every(r => r.status === 'resolved')).length,
    totalReports: reportsData.length
  };

  return (
    <PageLoader>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-600" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">Reported Lessons</h1>
            </div>
            <p className="text-text-secondary">Review and manage community-reported content</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.total}</p>
                <p className="text-xs text-text-secondary">Reported Lessons</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.pending}</p>
                <p className="text-xs text-text-secondary">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.resolved}</p>
                <p className="text-xs text-text-secondary">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <HiOutlineInformationCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalReports}</p>
                <p className="text-xs text-text-secondary">Total Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by lesson title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-cherry text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  filterStatus === 'resolved' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Reported Lessons Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Latest Report
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLessons.map((item) => (
                  <tr key={item.lesson._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.lesson.image}
                          alt={item.lesson.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="max-w-xs">
                          <h4 className="font-medium text-text truncate">{item.lesson.title}</h4>
                          <span className="text-xs bg-cherry-50 text-cherry px-2 py-0.5 rounded-full">
                            {item.lesson.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.lesson.creatorPhoto}
                          alt={item.lesson.creatorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-text">{item.lesson.creatorName}</p>
                          <p className="text-xs text-text-secondary">{item.lesson.creatorEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                          item.reportCount >= 5 
                            ? 'bg-red-100 text-red-700' 
                            : item.reportCount >= 3 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-gray-100 text-gray-700'
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
                          <p className="text-sm text-text font-medium">
                            {getReasonLabel(item.latestReport.reason)}
                          </p>
                          <p className="text-xs text-text-secondary">
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/lessons/${item.lesson._id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Lesson"
                        >
                          <HiOutlineBookOpen className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedLesson(item);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <h3 className="text-lg font-semibold text-text mb-2">No reported lessons</h3>
              <p className="text-text-secondary">
                {filterStatus === 'pending' 
                  ? 'All reports have been reviewed!' 
                  : 'No lessons match your search criteria'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReportedLessons.length)} of {filteredReportedLessons.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-cherry text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedLesson.lesson.image}
                      alt={selectedLesson.lesson.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-text">{selectedLesson.lesson.title}</h3>
                      <p className="text-sm text-text-secondary">by {selectedLesson.lesson.creatorName}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full mt-1">
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
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reports List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-text mb-4">All Reports</h4>
                <div className="space-y-4">
                  {selectedLesson.reports.map((report) => {
                    const reporter = getReporterInfo(report.reporterEmail);
                    return (
                      <div key={report._id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={reporter.photoURL}
                              alt={report.reporterName || reporter.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-text text-sm">{report.reporterName || reporter.name}</p>
                              <p className="text-xs text-text-secondary">{report.reporterEmail}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            report.status === 'pending' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-red-600 mb-2">{report.reason}</p>
                          {report.description && (
                            <p className="text-sm text-text-secondary mb-2">{report.description}</p>
                          )}
                          <p className="text-xs text-text-muted">
                            Reported on {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleIgnoreReports(selectedLesson.lesson._id)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 bg-white rounded-xl font-medium text-text hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Delete Lesson</h3>
                  <p className="text-sm text-text-secondary">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedLesson.lesson.image}
                    alt={selectedLesson.lesson.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-text line-clamp-1">{selectedLesson.lesson.title}</h4>
                    <p className="text-sm text-text-secondary">by {selectedLesson.lesson.creatorName}</p>
                    <p className="text-xs text-red-600 mt-1">{selectedLesson.reportCount} reports</p>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this lesson? All associated reports will also be removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-text hover:bg-gray-50 transition-colors"
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
