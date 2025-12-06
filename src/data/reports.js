// Dummy Reports Data
export const reports = [
  // Multiple reports for lesson l3 (The Power of Saying No)
  {
    _id: "r1",
    lessonId: "l3",
    reporterEmail: "user1@example.com",
    reporterName: "Alice Johnson",
    reason: "Inappropriate Content",
    description: "This lesson contains language that may be offensive to some readers.",
    status: "pending",
    createdAt: "2025-11-02T10:00:00Z"
  },
  {
    _id: "r2",
    lessonId: "l3",
    reporterEmail: "user2@example.com",
    reporterName: "Bob Smith",
    reason: "Sensitive or Disturbing Content",
    description: "The examples used in this lesson could be triggering for people with anxiety.",
    status: "pending",
    createdAt: "2025-11-03T14:00:00Z"
  },
  {
    _id: "r3",
    lessonId: "l3",
    reporterEmail: "charlie@example.com",
    reporterName: "Charlie Brown",
    reason: "Inappropriate Content",
    description: "Some sections promote unhealthy boundaries in relationships.",
    status: "pending",
    createdAt: "2025-11-28T09:00:00Z"
  },
  // Single report for lesson l8 (Gratitude Changes Everything)
  {
    _id: "r4",
    lessonId: "l8",
    reporterEmail: "user3@example.com",
    reporterName: "Diana Prince",
    reason: "Misleading or False Information",
    description: "The statistics mentioned about gratitude are not backed by credible sources.",
    status: "pending",
    createdAt: "2025-11-11T09:00:00Z"
  },
  // Multiple reports for lesson l5 (The Comparison Trap)
  {
    _id: "r5",
    lessonId: "l5",
    reporterEmail: "ethan@example.com",
    reporterName: "Ethan Hunt",
    reason: "Hate Speech or Harassment",
    description: "This lesson makes derogatory comments about certain social media platforms and their users.",
    status: "pending",
    createdAt: "2025-11-20T15:30:00Z"
  },
  {
    _id: "r6",
    lessonId: "l5",
    reporterEmail: "fiona@example.com",
    reporterName: "Fiona Green",
    reason: "Inappropriate Content",
    description: "Contains negative stereotypes about young people.",
    status: "pending",
    createdAt: "2025-11-25T11:15:00Z"
  },
  // Single report for lesson l1 (Embracing Change)
  {
    _id: "r7",
    lessonId: "l1",
    reporterEmail: "grace@example.com",
    reporterName: "Grace Kelly",
    reason: "Spam or Promotional Content",
    description: "This lesson appears to be promoting a specific self-help book without disclosure.",
    status: "pending",
    createdAt: "2025-12-01T08:45:00Z"
  },
  // Multiple reports for lesson l10 (Building Resilience)
  {
    _id: "r8",
    lessonId: "l10",
    reporterEmail: "henry@example.com",
    reporterName: "Henry Ford",
    reason: "Misleading or False Information",
    description: "The coping mechanisms suggested here are not scientifically proven and could be harmful.",
    status: "pending",
    createdAt: "2025-11-15T13:20:00Z"
  },
  {
    _id: "r9",
    lessonId: "l10",
    reporterEmail: "iris@example.com",
    reporterName: "Iris West",
    reason: "Sensitive or Disturbing Content",
    description: "This lesson discusses mental health issues without proper warnings or resources.",
    status: "pending",
    createdAt: "2025-11-18T16:00:00Z"
  },
  {
    _id: "r10",
    lessonId: "l10",
    reporterEmail: "jack@example.com",
    reporterName: "Jack Ryan",
    reason: "Misleading or False Information",
    description: "Recommends avoiding professional help which is dangerous advice.",
    status: "pending",
    createdAt: "2025-11-30T10:30:00Z"
  },
  // Single report for lesson l7 (Finding Your Purpose)
  {
    _id: "r11",
    lessonId: "l7",
    reporterEmail: "kate@example.com",
    reporterName: "Kate Bishop",
    reason: "Other",
    description: "This lesson is almost identical to a popular blog post from another author. Possible plagiarism.",
    status: "pending",
    createdAt: "2025-12-03T14:00:00Z"
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
