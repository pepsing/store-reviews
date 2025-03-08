import axios from 'axios';
import { getApiBaseUrl, getAuthCode } from '../config/env';

const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

request.interceptors.request.use(
  (config) => {
    const authCode = getAuthCode();
    if (authCode) {
      config.headers['X-Auth-Code'] = authCode;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request; 