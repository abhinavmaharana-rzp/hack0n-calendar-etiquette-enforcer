import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Dashboard APIs
export const getDashboardStats = async () => {
  return await api.get('/dashboard/stats');
};

export const getLeaderboard = async (limit = 50) => {
  return await api.get(`/dashboard/leaderboard?limit=${limit}`);
};

export const getUserStats = async (email) => {
  return await api.get(`/dashboard/user/${email}`);
};

export const getRoomStats = async () => {
  return await api.get('/dashboard/rooms');
};

export const getBadges = async () => {
  return await api.get('/dashboard/badges');
};

export const getCostAnalysis = async (avgSalary = 100000, startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  params.append('avgSalary', avgSalary);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return await api.get(`/dashboard/cost-analysis?${params.toString()}`);
};

export const getHeatmapData = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString();
  return await api.get(`/dashboard/heatmap${queryString ? `?${queryString}` : ''}`);
};

export const getTeamComparison = async (avgSalary = 100000) => {
  return await api.get(`/dashboard/teams?avgSalary=${avgSalary}`);
};

// Event APIs
export const getMeeting = async (eventId) => {
  return await api.get(`/events/${eventId}`);
};

export const registerMeeting = async (data) => {
  return await api.post('/events/register', data);
};

export const updateRSVP = async (data) => {
  return await api.post('/events/rsvp', data);
};

export const suggestAgenda = async (meetingTitle, attendeeCount, duration, meetingType) => {
  return await api.post('/events/suggest-agenda', {
    meetingTitle,
    attendeeCount,
    duration,
    meetingType
  });
};

export default api;