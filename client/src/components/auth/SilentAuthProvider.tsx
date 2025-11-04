// components/auth/SilentAuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SilentAuthProviderProps {
  children: React.ReactNode;
}

const SilentAuthProvider: React.FC<SilentAuthProviderProps> = ({ children }) => {
  const { initializeAuth } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
      setInitialized(true);
    }
  }, [initializeAuth, initialized]);

  return <>{children}</>;
};

export default SilentAuthProvider;