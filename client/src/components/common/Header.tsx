import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart'; 
interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const Header: React.FC<HeaderProps> = memo(({ 
  title, 
  showBackButton = false, 
  backUrl = '/dashboard' 
}) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // ADDED
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(backUrl);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
                title="Go back"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-green-600">{title}</h1>
              
              {/* User Role Badge */}
              {user && (
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : user.role === 'farmer'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {user.role}
                </span>
              )}
              
              {/* Verification Status */}
              {user && !user.is_verified && user.role !== 'admin' && (
                <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                  Pending Verification
                </span>
              )}
            </div>
          </div>

          {/* Right Section - User Info and Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-4 mr-4">
                  {/* Products Link */}
                  <Link 
                    to="/products" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Products
                  </Link>
                  
                  {/* Cart Link with Badge - ADDED */}
                  <Link 
                    to="/cart" 
                    className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    🛒 Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                  
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {user.profile_image ? (
                      <img
                        className="h-8 w-8 rounded-full border-2 border-gray-200"
                        src={user.profile_image}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 border-2 border-gray-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Panel Link */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              /* Login/Signup when not authenticated */
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - ADDED */}
        {user && (
          <div className="md:hidden flex justify-center space-x-6 pb-2 border-t border-gray-200 pt-3">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;