import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const studentsApi = {
  list: (params) => api.get('/students', { params }).then((r) => r.data),
  create: (payload) => api.post('/students', payload).then((r) => r.data),
  update: (roll, payload) => api.put(`/students/${roll}`, payload).then((r) => r.data),
  remove: (roll) => api.delete(`/students/${roll}`).then((r) => r.data),
};

export const activitiesApi = {
  list: (params) => api.get('/activities', { params }).then((r) => r.data),
  create: (payload) => api.post('/activities', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/activities/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/activities/${id}`).then((r) => r.data),
};

export const eventsApi = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/events/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
};

export const studentActivitiesApi = {
  list: () => api.get('/student-activities').then((r) => r.data),
  create: (payload) => api.post('/student-activities', payload).then((r) => r.data),
  update: (stid, actid, payload) => api.put(`/student-activities/${stid}/${actid}`, payload).then((r) => r.data),
  remove: (stid, actid) => api.delete(`/student-activities/${stid}/${actid}`).then((r) => r.data),
};

export const studentEventsApi = {
  list: () => api.get('/student-events').then((r) => r.data),
  create: (payload) => api.post('/student-events', payload).then((r) => r.data),
  update: (stid, evid, payload) => api.put(`/student-events/${stid}/${evid}`, payload).then((r) => r.data),
  remove: (stid, evid) => api.delete(`/student-events/${stid}/${evid}`).then((r) => r.data),
};

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard').then((r) => r.data),
  leaderboard: (params) => api.get('/reports/leaderboard', { params }).then((r) => r.data),
  activityParticipation: () => api.get('/reports/activity-participation').then((r) => r.data),
  eventParticipation: () => api.get('/reports/event-participation').then((r) => r.data),
};

export function extractError(error) {
  return error?.response?.data?.message || 'Operation failed';
}
