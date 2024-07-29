// src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const auditPlans = {
  fetchAll: () => api.get('/audit-plans').catch(error => {
    console.error('Error fetching audit plans:', error);
    throw error;
  }),
  create: (data) => api.post('/audit-plans', data),
  update: (id, data) => api.put(`/audit-plans/${id}`, data),
  delete: (id) => api.delete(`/audit-plans/${id}`),
};

// 添加一个通用的错误处理函数
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API call error:', error.response);
    return Promise.reject(error);
  }
);

export default api;