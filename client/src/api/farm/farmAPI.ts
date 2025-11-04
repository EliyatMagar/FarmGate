// api/farmAPI.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const farmAPI = {
  // Farmer endpoints
  createFarm: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/farms`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Farm creation failed');
    }

    return await response.json();
  },

  getMyFarms: async () => {
    const response = await fetch(`${API_BASE_URL}/farms/my-farms`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farms');
    }

    return await response.json();
  },

  getFarmById: async (farmId: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farm');
    }

    return await response.json();
  },

  updateFarm: async (farmId: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Farm update failed');
    }

    return await response.json();
  },

  getVerificationStatus: async (farmId: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/verification-status`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch verification status');
    }

    return await response.json();
  },

  // Public endpoints
  getPublicFarms: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(`${API_BASE_URL}/farms/public?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public farms');
    }

    return await response.json();
  },

  // Admin endpoints
  getPendingFarms: async () => {
    const response = await fetch(`${API_BASE_URL}/farms/admin/pending`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending farms');
    }

    return await response.json();
  },

  verifyFarm: async (farmId: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/admin/verify/${farmId}`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Farm verification failed');
    }

    return await response.json();
  },

  rejectFarm: async (farmId: string, rejectionReason: string) => {
    const response = await fetch(`${API_BASE_URL}/farms/admin/reject/${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Farm rejection failed');
    }

    return await response.json();
  },

  getAllFarms: async (status?: string, farmerId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (farmerId) params.append('farmer_id', farmerId);

    const response = await fetch(`${API_BASE_URL}/farms/admin/all?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all farms');
    }

    return await response.json();
  },
};