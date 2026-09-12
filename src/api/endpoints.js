import { api, qs } from './client';

export const auth = {
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (body) => api.patch('/auth/me', body),
  changePassword: (body) => api.post('/auth/change-password', body),
};

export const hotels = {
  list: (params) => api.get(`/hotels${qs(params)}`),
  facets: () => api.get('/hotels/facets'),
  get: (id, params) => api.get(`/hotels/${id}${qs(params)}`),
  availability: (id, params) => api.get(`/hotels/${id}/availability${qs(params)}`),
  review: (id, body) => api.post(`/hotels/${id}/reviews`, body),
  create: (body) => api.post('/hotels', body),
  update: (id, body) => api.patch(`/hotels/${id}`, body),
  remove: (id) => api.del(`/hotels/${id}`),
};

export const bookings = {
  list: (params) => api.get(`/bookings${qs(params)}`),
  get: (id) => api.get(`/bookings/${id}`),
  quote: (params) => api.get(`/bookings/quote${qs(params)}`),
  create: (body) => api.post('/bookings', body),
  setStatus: (id, body) => api.patch(`/bookings/${id}/status`, body),
  cancel: (id, body) => api.post(`/bookings/${id}/cancel`, body),
  update: (id, body) => api.patch(`/bookings/${id}`, body),
};

export const users = {
  list: (params) => api.get(`/users${qs(params)}`),
  get: (id) => api.get(`/users/${id}`),
  create: (body) => api.post('/users', body),
  update: (id, body) => api.patch(`/users/${id}`, body),
  resetPassword: (id, body) => api.post(`/users/${id}/reset-password`, body),
  remove: (id) => api.del(`/users/${id}`),
};

export const favorites = {
  list: () => api.get('/favorites'),
  add: (hotelId) => api.post('/favorites', { hotelId }),
  remove: (hotelId) => api.del(`/favorites/${hotelId}`),
};

export const stats = {
  admin: () => api.get('/stats/admin'),
  employee: (params) => api.get(`/stats/employee${qs(params)}`),
  me: () => api.get('/stats/me'),
};
