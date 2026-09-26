import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Accept': 'application/json',
    },
});

// Request interceptor: sematkan Bearer token otomatis dari localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('portal_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor: tangani 401 unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Jangan redirect otomatis jika sedang di endpoint login/register
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                localStorage.removeItem('portal_token');
                localStorage.removeItem('portal_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
