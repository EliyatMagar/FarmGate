// components/admin/AdminPanel.tsx
import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import UserVerification from './UserVerification';
import FarmVerification from './FarmVerification';
import CategoriesManagement from './categories/CategoriesManagement';

const AdminPanel: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'User Verification', href: '/admin/users', current: location.pathname === '/admin/users' },
    { name: 'Farm Verification', href: '/admin/farms', current: location.pathname === '/admin/farms' },
    { name: 'Category Management', href: '/admin/categories', current: location.pathname === '/admin/categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Panel" showBackButton backUrl="/dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="mt-6 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-8">
            <div className="py-6">
              <Routes>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<UserVerification />} />
                <Route path="farms" element={<FarmVerification />} />
                <Route path="categories" element={<CategoriesManagement />} />
                <Route path="*" element={<Navigate to="/admin/users" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;