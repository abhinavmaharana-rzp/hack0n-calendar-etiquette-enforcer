import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dashboard APIs
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getLeaderboard = async (limit = 50) => {
  const response = await api.get(`/dashboard/leaderboard?limit=${limit}`);
  return response.data;
};

export const getUserStats = async (email) => {
  const response = await api.get(`/dashboard/user/${email}`);
  return response.data;
};

export const getRoomStats = async () => {
  const response = await api.get('/dashboard/rooms');
  return response.data;
};

export const getBadges = async () => {
  const response = await api.get('/dashboard/badges');
  return response.data;
};

// Event APIs
export const getMeeting = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export default api;