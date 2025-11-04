// components/auth/AdminRoute.tsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
  silent?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, silent = false }) => {
  return (
    <ProtectedRoute requiredRole="admin" silent={silent}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;