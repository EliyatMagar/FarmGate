// api/authAPI.ts

import type { LoginCredentials,  } from '../../types/user';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  },

  register: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  },
};