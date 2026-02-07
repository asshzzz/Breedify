// src/services/api.js
import axios from 'axios';

// ====== Base Configuration ======
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ====== Axios Instance ======
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ====== Request Interceptor (Attach Token) ======
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== Response Interceptor (Handle Errors) ======
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 🔒 Unauthorized
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(data?.message || 'Something went wrong on server.');
    } else if (error.request) {
      return Promise.reject('⚠️ Network error. Please check your internet connection.');
    } else {
      return Promise.reject(error.message || 'Unexpected error occurred.');
    }
  }
);

// ===================== AUTH APIs =====================
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  refreshToken: () => api.post('/users/refresh-token'),
};

// ===================== RECORD APIs =====================
export const recordAPI = {
  create: (recordData) => api.post('/records', recordData),
  getAll: (params = {}) => api.get('/records', { params }),
  getById: (id) => api.get(`/records/${id}`),
  update: (id, recordData) => api.put(`/records/${id}`, recordData),
  delete: (id) => api.delete(`/records/${id}`),

  // ✅ Verify Animal ID (no auth)
  verifyAnimalId: (animalId) => api.get(`/records/verify/${animalId}`),

  // ✅ Seed dummy data (auth)
  seedDummyData: () => api.post('/records/seed-data'),
};

// ===================== IMAGE APIs =====================
export const imageAPI = {
  upload: (formData) =>
    api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ===================== REPORT APIs =====================
export const reportAPI = {
  create: (reportData) => api.post('/report', reportData),
  getAll: (params = {}) => api.get('/report', { params }),
  getById: (reportId) => api.get(`/report/${reportId}`),
  update: (reportId, reportData) => api.put(`/report/${reportId}`, reportData),
  delete: (reportId) => api.delete(`/report/${reportId}`),
  generate: (reportConfig) => api.post('/report/generate', reportConfig),
  exportPDF: (reportId) =>
    api.get(`/report/${reportId}/export`, { responseType: 'blob' }),
  getByDateRange: (startDate, endDate) =>
    api.get('/report', { params: { startDate, endDate } }),
  getByType: (reportType) =>
    api.get('/report', { params: { reportType } }),
};


// ================ settiings api ==================
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
};

// ===================== 🔥 ROBOFLOW BREED DETECTION API =====================
export const roboflowAPI = {
  predictBreed: async (imageFile) => {
    const MODEL_NAME = import.meta.env.ROBOFLOW_MODEL ;
    const VERSION = import.meta.env.ROBOFLOW_VERSION || "1";
    const API_KEY = import.meta.env.ROBOFLOW_API_KEY ;

    const url = `https://serverless.roboflow.com/asheer/workflows/detect-and-classify`;

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Roboflow response:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Roboflow Prediction Error:", err);
      throw err;
    }
  },
};

// ===================== UTILITIES =====================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => localStorage.getItem('token');

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export const setUserData = (user) =>
  localStorage.setItem('user', JSON.stringify(user));

export const getUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

export default api;
