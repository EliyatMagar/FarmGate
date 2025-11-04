// components/AuthProvider.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuth, token } = useAuth();

  useEffect(() => {
    // Check authentication status on app start if token exists
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return <>{children}</>;
};

export default AuthProvider;