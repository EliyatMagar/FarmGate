
const API_BASE_URL=import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const adminAPI = {
  getPendingUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/admin/pending`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending users');
    }

    return await response.json();
  },

  verifyUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/admin/verify/${userId}`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to verify user');
    }

    return await response.json();
  },
};