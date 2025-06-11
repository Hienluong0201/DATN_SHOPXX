import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: 'https://your-api-base-url/', // Có thể là GHN hoặc API của bạn
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
    // Token có thể được thêm động ở đây nếu cần
  },
});

// Interceptor để xử lý lỗi hoặc thêm token động
AxiosInstance.interceptors.request.use(
  config => {
    // Thêm token nếu cần
    config.headers.Token = '8fd58e73-4633-11f0-9b81-222185cb68c8';
    return config;
  },
  error => Promise.reject(error)
);

export default AxiosInstance;