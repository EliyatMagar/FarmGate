// components/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'farmer' | 'buyer' | 'admin';
  silent?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  silent = false 
}) => {
  const { isAuthenticated, user, checkAuthSilently } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Only check auth if we haven't done an initial check
      if (!initialCheckDone) {
        if (silent) {
          await checkAuthSilently();
        }
        setInitialCheckDone(true);
      }
      setCheckingAuth(false);
    };

    checkAuthentication();
  }, [silent, checkAuthSilently, initialCheckDone]);

  // For silent checks, don't show loading spinner
  if (checkingAuth && !silent) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // For silent checks, just return null while checking
  if (checkingAuth && silent) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role (if specified)
  if (requiredRole && user?.role !== requiredRole) {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'farmer':
        return <Navigate to="/dashboard/farmer" replace />;
      case 'buyer':
        return <Navigate to="/dashboard/buyer" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Check if user is verified (except for admin)
  if (user?.role !== 'admin' && !user?.is_verified) {
    if (silent) {
      return null;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Verification notice UI */}
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;