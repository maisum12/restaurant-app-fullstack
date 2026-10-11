import AsyncStorage from '@react-native-async-storage/async-storage';

// Yahan apni laptop ki IPv4 address likhein (localhost phone par kaam nahi karega)
export const BASE_URL = 'http://192.168.1.103:5000'; // <-- Apni IP se replace karein

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = await AsyncStorage.getItem('@auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config = {
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || 'Network request failed';
    throw new Error(errorMsg);
  }

  return data;
}