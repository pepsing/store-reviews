import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../config/env';

const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// 需要授权的请求方法
const requiresAuth = (config: AxiosRequestConfig): boolean => {
  const method = config.method?.toLowerCase();
  return method === 'post' || method === 'put' || method === 'delete';
};

// 从 localStorage 获取授权码
const getAuthCode = () => localStorage.getItem('auth_code') || '';

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });

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
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default request; 