import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const triggerDeploy = (repoUrl, appName) =>
  api.post('/deploy', { repoUrl, appName });

export const fetchHealth = () => api.get('/health');
export const fetchMetrics = () => api.get('/metrics');
export const fetchContainers = () => api.get('/containers');
export const fetchHistory = () => api.get('/history');

export default api;
