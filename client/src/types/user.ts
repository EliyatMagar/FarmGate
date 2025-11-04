// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin';
  phone?: string;
  address?: string;
  location?: string;
  profile_image?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'buyer';
  phone?: string;
  address?: string;
  location?: string;
  profile_image?: File;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: T;
  users?: T[];
}