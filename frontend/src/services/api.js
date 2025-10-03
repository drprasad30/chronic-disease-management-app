import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export const patientService = {
  async list() {
    const { data } = await apiClient.get('/patients');
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/patients', payload);
    return data;
  },
  async get(patientId) {
    const { data } = await apiClient.get(`/patients/${patientId}`);
    return data;
  },
  async update(patientId, payload) {
    const { data } = await apiClient.put(`/patients/${patientId}`, payload);
    return data;
  },
  async remove(patientId) {
    const { data } = await apiClient.delete(`/patients/${patientId}`);
    return data;
  }
};

export const kpiService = {
  async create(payload) {
    const { data } = await apiClient.post('/kpi', payload);
    return data;
  },
  async summary() {
    const { data } = await apiClient.get('/kpi/summary');
    return data;
  },
  async byDisease(diseaseType) {
    const { data } = await apiClient.get(`/kpi/disease/${diseaseType}`);
    return data;
  }
};

export const recallService = {
  async list() {
    const { data } = await apiClient.get('/recalls');
    return data;
  },
  async byPriority(priority) {
    const { data } = await apiClient.get(`/recalls/priority/${priority}`);
    return data;
  }
};

export const dashboardService = {
  async overview() {
    const { data } = await apiClient.get('/dashboard/overview');
    return data;
  }
};

export default apiClient;
