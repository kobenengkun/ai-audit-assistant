import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
});

// 添加请求拦截器,用于日志记录
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器,用于日志记录和错误处理
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// 统一的错误处理函数
function handleApiError(error) {
  console.error('API Error:', error);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
    console.error('Request URL:', error.config.url);
    if (error.response.status === 404) {
      console.error('Resource not found. Please check if the API endpoint is correct.');
    }
  } else if (error.request) {
    console.error('No response received. Request:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  return Promise.reject(error);
}

export const auditPlans = {
  fetchAll: () => api.get('/audit-plans').then(response => response.data).catch(handleApiError),
  create: (data) => api.post('/audit-plans', data).catch(handleApiError),
  update: (id, data) => api.put(`/audit-plans/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/audit-plans/${id}`).catch(handleApiError),
  fetchById: (id) => api.get(`/audit-plans/${id}`).then(response => response.data).catch(handleApiError),
  getAiSuggestions: () => api.get('/audit-plans/ai-suggestions').then(response => response.data).catch(handleApiError),
  applyAiSuggestions: () => api.post('/audit-plans/apply-ai-suggestions').then(response => response.data).catch(handleApiError),
};

export const dashboard = {
  fetchData: () => api.get('/dashboard')
    .then(response => {
      console.log('Dashboard API response:', response.data);
      return response.data;
    })
    .catch(handleApiError),
};

export const auditTasks = {
  fetchAll: () => {
    console.log('Fetching all audit tasks...');
    return api.get('/audit-tasks')
      .then(response => {
        console.log('Audit tasks fetched successfully:', response.data);
        return response.data;
      })
      .catch(handleApiError);
  },
  fetchPending: () => api.get('/audit-tasks?status=pending').then(response => response.data).catch(handleApiError),
  fetchCompleted: () => api.get('/audit-tasks?status=completed').then(response => response.data).catch(handleApiError),
  create: (data) => api.post('/audit-tasks', data).catch(handleApiError),
  update: (id, data) => api.put(`/audit-tasks/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/audit-tasks/${id}`).catch(handleApiError),
};

export const auditReports = {
  fetchAll: () => api.get('/audit-reports').then(response => response.data).catch(handleApiError),
  create: (data) => api.post('/audit-reports', data).catch(handleApiError),
  fetchById: (id) => api.get(`/audit-reports/${id}`).then(response => response.data).catch(handleApiError),
};

export const auditImprovements = {
  fetchSuppliers: () => api.get('/audit-improvements/suppliers')
    .then(response => response.data)
    .catch(handleApiError),
  markAsCompleted: (supplierId) => api.put(`/audit-improvements/suppliers/${supplierId}/complete`)
    .then(response => response.data)
    .catch(handleApiError),
  updateSupplier: (supplierId, data) => api.put(`/audit-improvements/suppliers/${supplierId}`, data)
    .then(response => response.data)
    .catch(handleApiError),
};

// 新增 aiService 对象
export const aiService = {
  prioritizeTasks: (tasks) => {
    console.log('Prioritizing tasks with AI...');
    return api.post('/ai/prioritize-tasks', { tasks })
      .then(response => {
        console.log('Tasks prioritized successfully:', response.data);
        return response.data;
      })
      .catch(handleApiError);
  },
  analyzeDocument: (file) => {
    console.log('Analyzing document with AI...');
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(response => {
        console.log('Document analyzed successfully:', response.data);
        return response.data;
      })
      .catch(handleApiError);
  },
  getAuditGuidance: (task) => {
    console.log('Getting AI audit guidance...');
    return api.post('/ai/audit-guidance', { task })
      .then(response => {
        console.log('Audit guidance received:', response.data);
        return response.data;
      })
      .catch(handleApiError);
  },
  detectAnomalies: (tasks) => {
    console.log('Detecting anomalies with AI...');
    return api.post('/ai/detect-anomalies', { tasks })
      .then(response => {
        console.log('Anomalies detected:', response.data);
        return response.data;
      })
      .catch(handleApiError);
  }
};

export default api;