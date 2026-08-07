import axios from 'axios';

const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost')) {
    return 'https://automatex-a839.onrender.com/api/v1';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle HTTP Errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    const requestUrl = error.config?.url || 'unknown';

    if (response && response.status === 401) {
      // Differentiate between AutomateX User JWT Auth Expiration vs Third-Party Integration Credential Error
      const isUserAuthTokenError =
        response.headers?.['x-automatex-user-auth-error'] === 'true' ||
        response.data?.isUserAuthTokenError === true ||
        response.data?.code === 'USER_AUTH_EXPIRED' ||
        requestUrl.includes('/auth/me') ||
        requestUrl.includes('/auth/refresh');

      if (isUserAuthTokenError) {
        console.warn(`[AxiosInterceptor] 🔴 AutomateX User JWT Session Expired on ${requestUrl}. Redirecting to /login.`, {
          url: requestUrl,
          status: 401,
          responseData: response.data,
          stackTrace: new Error().stack,
        });

        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/oauth/callback') &&
          window.location.pathname !== '/'
        ) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } else {
        console.warn(`[AxiosInterceptor] ⚠️ Preserving User Session: Received 401 from Third-Party Integration API (${requestUrl}).`, {
          url: requestUrl,
          status: 401,
          isThirdPartyError: true,
          responseData: response.data,
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
