// Dummy Comments Data
export const comments = [
  {
    _id: "c1",
    lessonId: "l1",
    userEmail: "michael@example.com",
    userName: "Michael Chen",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "This really resonated with me. I've been struggling with saying no at work, and this gives me the courage to start setting boundaries.",
    createdAt: "2025-11-16T10:30:00Z"
  },
  {
    _id: "c2",
    lessonId: "l1",
    userEmail: "emily@example.com",
    userName: "Emily Davis",
    userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Beautiful lesson! I wish I had learned this earlier in life. Better late than never though!",
    createdAt: "2025-11-17T14:20:00Z"
  },
  {
    _id: "c3",
    lessonId: "l2",
    userEmail: "sarah@example.com",
    userName: "Sarah Johnson",
    userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    content: "Thank you for sharing your vulnerability. Failure is indeed just feedback. This story is inspiring!",
    createdAt: "2025-10-21T09:15:00Z"
  },
  {
    _id: "c4",
    lessonId: "l2",
    userEmail: "lisa@example.com",
    userName: "Lisa Anderson",
    userPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content: "I went through something similar. It's comforting to know I'm not alone. Thank you for this.",
    createdAt: "2025-10-22T16:45:00Z"
  },
  {
    _id: "c5",
    lessonId: "l4",
    userEmail: "emily@example.com",
    userName: "Emily Davis",
    userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "This is exactly what I needed to hear today. Taking a mental health day tomorrow!",
    createdAt: "2025-09-16T11:00:00Z"
  },
  {
    _id: "c6",
    lessonId: "l5",
    userEmail: "james@example.com",
    userName: "James Wilson",
    userPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Following your passion takes courage. Your story proves that unconventional paths can lead to extraordinary outcomes.",
    createdAt: "2025-08-11T13:30:00Z"
  }
];

// Get comments by lesson
export const getCommentsByLesson = (lessonId) => {
  return comments.filter(comment => comment.lessonId === lessonId);
};

export default comments;
