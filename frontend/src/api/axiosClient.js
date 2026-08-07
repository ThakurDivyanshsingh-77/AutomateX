import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    const requestUrl = error.config?.url || 'unknown';

    if (response && response.status === 401) {
      const isUserAuthTokenError =
        response.headers?.['x-automatex-user-auth-error'] === 'true' ||
        response.data?.isUserAuthTokenError === true ||
        response.data?.code === 'USER_AUTH_EXPIRED' ||
        requestUrl.includes('/auth/me') ||
        requestUrl.includes('/auth/refresh');

      if (isUserAuthTokenError) {
        console.warn(`[AxiosClient] 🔴 AutomateX User JWT Session Expired on ${requestUrl}. Clearing session.`, {
          url: requestUrl,
          status: 401,
          responseData: response.data,
          stackTrace: new Error().stack,
        });

        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/oauth/callback')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.warn(`[AxiosClient] ⚠️ Preserving User Session: Received 401 from Third-Party Integration API (${requestUrl}).`, {
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

export default axiosClient;
