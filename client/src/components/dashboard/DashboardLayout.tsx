// components/dashboard/DashboardLayout.tsx
import React, { memo, useMemo } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import Header from '../common/Header';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({ children }) => {
  const { user, isChecking } = useAuthStatus();
  const location = useLocation();

  // Memoize navigation to prevent unnecessary recalculations
  const navigation = useMemo(() => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
      { name: 'Profile', href: '/dashboard/profile', current: location.pathname === '/dashboard/profile' },
    ];

    // Add role-specific navigation
    if (user?.role === 'farmer') {
      return [
        ...baseNavigation,
        { name: 'My Farms', href: '/dashboard/farms', current: location.pathname.includes('/dashboard/farms') },
        { name: 'My Products', href: '/dashboard/products', current: location.pathname.includes('/dashboard/products') },
        { name: 'Farmer Dashboard', href: '/dashboard/farmer', current: location.pathname === '/dashboard/farmer' }
      ];
    }

    if (user?.role === 'buyer') {
      return [
        ...baseNavigation,
        { name: 'Browse Farms', href: '/dashboard/farms', current: location.pathname.includes('/dashboard/farms') },
        { name: 'Buyer Dashboard', href: '/dashboard/buyer', current: location.pathname === '/dashboard/buyer' },
      ];
    }

    return baseNavigation;
  }, [location.pathname, user?.role]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AgroConnect" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation - Only show if user is authenticated */}
          {user && (
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                    Navigation
                  </h3>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        item.current
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {item.current && (
                        <span className="ml-auto w-2 h-2 bg-green-600 rounded-full"></span>
                      )}
                    </Link>
                  ))}
                </nav>

                {/* User Info in Sidebar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-3">
                    {user.profile_image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.profile_image}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  {!user.is_verified && user.role !== 'admin' && (
                    <div className="mt-3 px-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                        <p className="text-xs text-yellow-800">
                          Account pending verification
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)]">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;