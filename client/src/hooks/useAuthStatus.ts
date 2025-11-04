import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { checkAuthStatus } from '../store/slices/auth/authSlice';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Custom hook to check and manage authentication status
 * Provides user authentication state and loading status
 */
export const useAuthStatus = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if we have a token but no user data
      if (!user && !loading) {
        try {
          await dispatch(checkAuthStatus()).unwrap();
        } catch (error) {
          // Silent fail - user is not authenticated
          console.log('Authentication check failed:', error);
        }
      }
    };

    checkAuth();
  }, [dispatch, user, loading]);

  // Determine if we're still checking authentication
  const isChecking = loading && !user;

  return {
    // User data
    user,
    
    // Authentication state
    isAuthenticated,
    isChecking,
    
    // Loading states
    loading,
    
    // Error state
    error,
    
    // User role specific booleans for easy conditional rendering
    isFarmer: user?.role === 'farmer',
    isBuyer: user?.role === 'buyer',
    isAdmin: user?.role === 'admin',
    
    // Verification status
    isVerified: user?.is_verified || false,
    
    // User profile completeness (example criteria)
    hasCompleteProfile: !!(user?.name && user?.email && user?.phone),
  };
};

/**
 * Hook for protecting routes that require authentication
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isChecking, user } = useAuthStatus();

  return {
    isAuthenticated,
    isChecking,
    user,
    canAccess: isAuthenticated && !isChecking,
  };
};

/**
 * Hook for protecting routes that require specific roles
 */
export const useRequireRole = (allowedRoles: string[]) => {
  const { isAuthenticated, isChecking, user } = useAuthStatus();

  const hasRequiredRole = user && allowedRoles.includes(user.role);
  const canAccess = isAuthenticated && !isChecking && hasRequiredRole;

  return {
    isAuthenticated,
    isChecking,
    user,
    hasRequiredRole,
    canAccess,
  };
};

/**
 * Hook for protecting farmer-specific routes
 */
export const useRequireFarmer = () => {
  return useRequireRole(['farmer']);
};

/**
 * Hook for protecting buyer-specific routes
 */
export const useRequireBuyer = () => {
  return useRequireRole(['buyer']);
};

/**
 * Hook for protecting admin-specific routes
 */
export const useRequireAdmin = () => {
  return useRequireRole(['admin']);
};

export default useAuthStatus;