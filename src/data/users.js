// Dummy Users Data
export const users = [
  {
    _id: "u1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "user",
    isPremium: true,
    createdAt: "2025-01-15T10:00:00Z"
  },
  {
    _id: "u2",
    name: "Michael Chen",
    email: "michael@example.com",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "user",
    isPremium: false,
    createdAt: "2025-02-20T10:00:00Z"
  },
  {
    _id: "u3",
    name: "Emily Davis",
    email: "emily@example.com",
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "admin",
    isPremium: true,
    createdAt: "2025-01-01T10:00:00Z"
  },
  {
    _id: "u4",
    name: "James Wilson",
    email: "james@example.com",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "user",
    isPremium: true,
    createdAt: "2025-03-10T10:00:00Z"
  },
  {
    _id: "u5",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    role: "user",
    isPremium: false,
    createdAt: "2025-04-05T10:00:00Z"
  }
];

// Current logged-in user (for testing)
export const currentUser = {
  _id: "u1",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  role: "user",
  isPremium: true,
  createdAt: "2025-01-15T10:00:00Z"
};

export default users;
