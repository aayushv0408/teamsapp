import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function notifyTaskChange() {
  const payload = { ts: Date.now() };
  window.dispatchEvent(new CustomEvent('task-updated', { detail: payload }));
  localStorage.setItem('task-updated', JSON.stringify(payload));
}

export function subscribeToTaskChange(callback) {
  const handleCustomEvent = () => callback();
  const handleStorageEvent = (event) => {
    if (event.key === 'task-updated') {
      callback();
    }
  };

  window.addEventListener('task-updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('task-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export default api;
