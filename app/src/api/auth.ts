import apiClient from './client';

export const loginApi = async (email: string, password: string, subdomain?: string) => {
  try {
    const config = subdomain ? { headers: { 'x-tenant-subdomain': subdomain } } : {};
    const response = await apiClient.post('/auth/login', { email, password }, config);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const apiError: any = new Error(error.response.data.message || 'Login failed');
      if (error.response.data.subdomain) {
        apiError.subdomain = error.response.data.subdomain;
      }
      throw apiError;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const getMeApi = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to fetch user profile');
  }
};
