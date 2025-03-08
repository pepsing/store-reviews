export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
}; 