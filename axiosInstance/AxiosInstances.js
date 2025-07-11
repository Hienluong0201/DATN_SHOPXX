import axios from 'axios';

const AxiosInstance = (contentType = 'application/json') => {
  const axiosInstance = axios.create({
    baseURL: 'https://datn-sever.onrender.com/',
  });

  axiosInstance.interceptors.request.use(
    async (config) => {
      config.headers = {
        ...config.headers,
        'Accept': 'application/json',
        ...(contentType !== 'multipart/form-data'
          ? { 'Content-Type': contentType }
          : {}), // Đừng set nếu là multipart
      };
      return config;
    },
    err => Promise.reject(err)
  );

  return axiosInstance;
};

export default AxiosInstance;
