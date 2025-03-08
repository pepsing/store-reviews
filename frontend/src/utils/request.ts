import axios, { AxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../config/env';

const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// 从 localStorage 获取授权码
const getAuthCode = () => localStorage.getItem('auth_code') || '';

// 需要授权的请求方法
const requiresAuth = (config: AxiosRequestConfig): boolean => {
  const method = config.method?.toLowerCase();
  return method === 'post' || method === 'put' || method === 'delete';
};

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (requiresAuth(config)) {
      const authCode = getAuthCode();
      if (authCode) {
        config.headers = config.headers || {};
        config.headers['X-Auth-Code'] = authCode;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default request; 