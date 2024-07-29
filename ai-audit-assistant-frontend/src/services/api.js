// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// 现有的 auditPlans 对象保持不变
export const auditPlans = {
  // ... 保持现有代码不变
};

// 添加新的 dashboard API 函数
export const dashboard = {
  fetchData: () => api.get('/dashboard').then(response => {
    console.log('Dashboard API response:', response);
    return response;
  }).catch(error => {
    console.error('Error fetching dashboard data:', error.response || error);
    throw error;
  }),
};

// 添加其他可能需要的 API 函数
export const auditTasks = {
  fetchAll: () => api.get('/audit-tasks'),
  fetchPending: () => api.get('/audit-tasks?status=pending'),
  fetchCompleted: () => api.get('/audit-tasks?status=completed'),
  create: (data) => api.post('/audit-tasks', data),
  update: (id, data) => api.put(`/audit-tasks/${id}`, data),
  delete: (id) => api.delete(`/audit-tasks/${id}`),
};

export const auditReports = {
  fetchAll: () => api.get('/audit-reports'),
  create: (data) => api.post('/audit-reports', data),
  fetchById: (id) => api.get(`/audit-reports/${id}`),
};

// 保持现有的错误处理拦截器
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API call error:', error.response);
    return Promise.reject(error);
  }
);

export default api;