export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const getAuthCode = () => {
  return process.env.REACT_APP_AUTH_CODE || '';
}; 