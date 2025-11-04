// hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from './redux';
import { 
  loginUser, 
  registerUser, 
  logout, 
  getProfile, 
  clearError, 
  checkAuthStatus 
} from '../store/slices/auth/authSlice';
import { useCallback, useRef } from 'react';
import type { LoginCredentials } from '../types/user';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const lastAuthCheckRef = useRef<number>(0);
  const AUTH_CHECK_THROTTLE = 30000; // 30 seconds

  // Async thunks
  const login = useCallback((credentials: LoginCredentials) => 
    dispatch(loginUser(credentials)), [dispatch]);
  
  const register = useCallback((userData: FormData) => 
    dispatch(registerUser(userData)), [dispatch]);
  
  const logoutAction = useCallback(() => 
    dispatch(logout()), [dispatch]);
  
  const fetchProfile = useCallback(() => 
    dispatch(getProfile()), [dispatch]);
  
  const clearErrorAction = useCallback(() => 
    dispatch(clearError()), [dispatch]);
  
  const checkAuth = useCallback(() => 
    dispatch(checkAuthStatus()), [dispatch]);

  // UPDATED: Throttled silent authentication check
  const checkAuthSilently = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    
    // Throttle checks to prevent excessive API calls
    if (now - lastAuthCheckRef.current < AUTH_CHECK_THROTTLE) {
      return isAuthenticated;
    }
    
    lastAuthCheckRef.current = now;
    
    try {
      if (token) {
        await dispatch(checkAuthStatus()).unwrap();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [dispatch, token, isAuthenticated]);

  // UPDATED: Initialize auth only once
  const initializeAuth = useCallback(async (): Promise<void> => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        // Silent fail - just clear invalid token
        localStorage.removeItem('token');
      }
    }
  }, [dispatch, isAuthenticated]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout: logoutAction,
    fetchProfile,
    clearError: clearErrorAction,
    checkAuth,
    
    // Silent methods
    checkAuthSilently,
    initializeAuth,
  };
};