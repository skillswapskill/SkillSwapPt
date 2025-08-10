import { apiClient, API_BASE_URL } from '../config/api';

export const useApi = () => {
  console.log(`🔧 Using API Base URL: ${API_BASE_URL}`);
  
  return {
    apiClient,
    baseUrl: API_BASE_URL,
    
    // Helper methods for common operations
    get: (url, config) => apiClient.get(url, config),
    post: (url, data, config) => apiClient.post(url, data, config),
    put: (url, data, config) => apiClient.put(url, data, config),
    delete: (url, config) => apiClient.delete(url, config),
  };
};
