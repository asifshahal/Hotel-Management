import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('hotel_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('hotel_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const authAPI = {
    login: (data) => API.post('/auth/login', data),
    changePassword: (data) => API.post('/auth/change-password', data),
};

export const roomsAPI = {
    getAll: () => API.get('/rooms'),
    create: (data) => API.post('/rooms', data),
    update: (id, data) => API.put(`/rooms/${id}`, data),
    delete: (id) => API.delete(`/rooms/${id}`),
};

export const bookingsAPI = {
    getAll: () => API.get('/bookings'),
    create: (data) => API.post('/bookings', data),
    update: (id, data) => API.put(`/bookings/${id}`, data),
    delete: (id) => API.delete(`/bookings/${id}`),
};

export const guestsAPI = {
    getAll: () => API.get('/guests'),
    create: (data) => API.post('/guests', data),
    update: (id, data) => API.put(`/guests/${id}`, data),
    delete: (id) => API.delete(`/guests/${id}`),
};

export const staffAPI = {
    getAll: () => API.get('/staff'),
    create: (data) => API.post('/staff', data),
    update: (id, data) => API.put(`/staff/${id}`, data),
    delete: (id) => API.delete(`/staff/${id}`),
};

export const dashboardAPI = {
    getStats: () => API.get('/dashboard/stats'),
};

export default API;
