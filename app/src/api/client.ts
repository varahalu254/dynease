import axios from 'axios';
import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

// When using Android emulator, localhost is 10.0.2.2. For iOS/Web it's usually localhost.
// Replace this with your actual local IP address if running on a physical device over Wi-Fi.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.dynease.in/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token in the future
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    const subdomain = await SecureStore.getItemAsync('subdomain');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (subdomain) {
      config.headers['x-tenant-subdomain'] = subdomain;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('role');
      await SecureStore.deleteItemAsync('subdomain');
      await SecureStore.deleteItemAsync('restaurantName');
      
      const { router } = require('expo-router');
      router.replace('/');

      // Return a clean error instead of the full AxiosError to avoid massive red stack traces on logout
      return Promise.reject(new Error('Session expired (401). Logged out automatically.'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
