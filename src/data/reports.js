// Dummy Reports Data
export const reports = [
  {
    _id: "r1",
    lessonId: "l3",
    reporterEmail: "user1@example.com",
    reason: "Inappropriate Content",
    createdAt: "2025-11-02T10:00:00Z"
  },
  {
    _id: "r2",
    lessonId: "l3",
    reporterEmail: "user2@example.com",
    reason: "Sensitive or Disturbing Content",
    createdAt: "2025-11-03T14:00:00Z"
  },
  {
    _id: "r3",
    lessonId: "l8",
    reporterEmail: "user3@example.com",
    reason: "Misleading or False Information",
    createdAt: "2025-11-11T09:00:00Z"
  }
];

// Report reasons for dropdown
export const reportReasons = [
  "Inappropriate Content",
  "Hate Speech or Harassment",
  "Misleading or False Information",
  "Spam or Promotional Content",
  "Sensitive or Disturbing Content",
  "Other"
];

// Get reports by lesson
export const getReportsByLesson = (lessonId) => {
  return reports.filter(report => report.lessonId === lessonId);
};

// Get report count by lesson
export const getReportCount = (lessonId) => {
  return reports.filter(report => report.lessonId === lessonId).length;
};

export default reports;
