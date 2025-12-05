// Dummy Favorites Data
export const favorites = [
  {
    _id: "f1",
    userEmail: "sarah@example.com",
    lessonId: "l2",
    createdAt: "2025-10-22T10:00:00Z"
  },
  {
    _id: "f2",
    userEmail: "sarah@example.com",
    lessonId: "l4",
    createdAt: "2025-09-17T15:00:00Z"
  },
  {
    _id: "f3",
    userEmail: "sarah@example.com",
    lessonId: "l5",
    createdAt: "2025-08-12T09:00:00Z"
  },
  {
    _id: "f4",
    userEmail: "michael@example.com",
    lessonId: "l1",
    createdAt: "2025-11-16T11:00:00Z"
  },
  {
    _id: "f5",
    userEmail: "michael@example.com",
    lessonId: "l9",
    createdAt: "2025-09-02T14:00:00Z"
  },
  {
    _id: "f6",
    userEmail: "emily@example.com",
    lessonId: "l4",
    createdAt: "2025-09-18T10:00:00Z"
  },
  {
    _id: "f7",
    userEmail: "emily@example.com",
    lessonId: "l5",
    createdAt: "2025-08-13T16:00:00Z"
  }
];

// Get favorites by user
export const getFavoritesByUser = (email) => {
  return favorites.filter(fav => fav.userEmail === email);
};

// Check if lesson is favorited by user
export const isFavorited = (email, lessonId) => {
  return favorites.some(fav => fav.userEmail === email && fav.lessonId === lessonId);
};

export default favorites;
