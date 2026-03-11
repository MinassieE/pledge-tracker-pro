import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Request interceptor to add auth token and project_id
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add project_id to all requests except auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (!isAuthEndpoint) {
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      if (selectedProjectId) {
        // Add project_id as query parameter
        config.params = {
          ...config.params,
          project_id: selectedProjectId,
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 errors - only reload for project access issues
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      
      // Only clear project and reload if it's specifically a project access error
      if (errorMessage.toLowerCase().includes('not assigned to this project') || 
          errorMessage.toLowerCase().includes('no access to this project')) {
        localStorage.removeItem('selectedProjectId');
        window.location.reload();
      }
      // For other 403 errors (like unauthorized actions), just let the error propagate
      // so the UI can show a proper error message
    }
    
    return Promise.reject(error);
  }
);

export default api;
