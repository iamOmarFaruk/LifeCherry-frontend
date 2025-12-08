import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
});

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token || null;
};

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Report API
export const reportAPI = {
  createReport: (lessonId, data) => apiClient.post(`/lessons/${lessonId}/reports`, data),
  checkUserReport: (lessonId) => apiClient.get(`/lessons/${lessonId}/my-report`),
  getUserReports: (params) => apiClient.get('/reports/my-reports', { params }),
  withdrawReport: (reportId) => apiClient.delete(`/reports/${reportId}`),
  getAllReports: (params) => apiClient.get('/reports', { params }),
  reviewReport: (reportId, data) => apiClient.patch(`/reports/${reportId}`, data),
};

export default apiClient;
