import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ============================
// Request Interceptor
// ============================
apiClient.interceptors.request.use((config) => config);
// ============================
// Response Interceptor
// ============================
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isAxiosError = axios.isAxiosError(error);
    const err = error as AxiosError;

    const method = err.config?.method?.toUpperCase() ?? '(no method)';
    const url = err.config?.url ?? '(no URL)';
    const status = err.response?.status ?? 'unknown';
    const message = err.message ?? 'Unknown error';

    const formatted = [
      '----- API ERROR -----',
      `Method: ${method}`,
      `URL: ${url}`,
      `Status: ${status}`,
      `Message: ${message}`,
      err.response?.data ? `Data: ${JSON.stringify(err.response.data, null, 2)}` : '',
      '----------------------',
    ]
      .filter(Boolean)
      .join('\n');

    if (process.env.NODE_ENV === 'development') {
      console.error(formatted);
    }

    return Promise.reject({
      message,
      status,
      url,
      data: err.response?.data,
      isAxiosError,
    });
  }
);

export default apiClient;
