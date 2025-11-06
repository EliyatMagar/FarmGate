// App.tsx - Updated with Error Boundary
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Import Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';
import {StripeProvider} from './context/StripeContext'

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/adminRoute';
import SilentAuthProvider from './components/auth/SilentAuthProvider';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import DashboardHome from './components/dashboard/DashboardHome';
import Profile from './components/dashboard/Profile';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import BuyerDashboard from './components/dashboard/BuyerDashboard';

// Farm Components
import FarmManagement from './components/farm/FarmManagement';
import MyFarmsList from './components/farm/MyFarmsList';
import CreateFarmForm from './components/farm/CreateFarmForm';
import FarmDetails from './components/farm/FarmDetials';
import EditFarmForm from './components/farm/EditFarmForm';

// Product Components
import ProductsDashboard from './components/products/ProductDashboard';
import CreateProductPage from './components/products/CreateProductPage';
import EditProductPage from './components/products/EditProductPage';
import BuyerProductsPage from './components/products/BuyerProductsPage';

// Cart Components
import CartPage from './components/cart/CartPage';

// Checkout Components
import CheckoutPage from './components/checkout/CheckoutPage';

// Order Components
import BuyerOrdersPage from './components/orders/BuyerOrderPage';
import BuyerOrdersDetailsPage from './components/orders/BuyerOrderDetails';
import FarmerOrdersPage from './components/orders/FarmerOrdersPage';
import FarmerOrderDetailsPage from './components/orders/FarmerOrderDetailsPage';

import { PaymentSuccess } from './components/payment/PaymentSuccess';

// Admin Components
import AdminPanel from './components/admin/AdminPanel';
import UserVerification from './components/admin/UserVerification';
import FarmVerification from './components/admin/FarmVerification';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <StripeProvider>
        <SilentAuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />

                {/* Cart Route - Protected */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <CartPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Checkout Route - Protected */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <CheckoutPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Products Route - Protected */}
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <BuyerProductsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Orders Routes - Protected */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <BuyerOrdersPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <BuyerOrdersDetailsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Dashboard Routes with Silent Auth */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute silent={true}>
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard Index Route */}
                  <Route index element={<DashboardHome />} />

                  {/* Profile Route */}
                  <Route path="profile" element={<Profile />} />

                  {/* Farm Management Routes */}
                  <Route path="farms" element={<FarmManagement />}>
                    <Route index element={<MyFarmsList />} />
                    <Route path="create" element={<CreateFarmForm />} />
                    <Route path=":id" element={<FarmDetails />} />
                    <Route path=":id/edit" element={<EditFarmForm />} />
                  </Route>

                  {/* Product Management Routes */}
                  <Route path="products" element={<ProductsDashboard />} />
                  <Route path="products/create" element={<CreateProductPage />} />
                  <Route path="products/edit/:id" element={<EditProductPage />} />

                  {/* Role-specific Dashboard Routes */}
                  <Route path="farmer" element={<FarmerDashboard />} />
                  <Route 
                    path="buyer" 
                    element={
                      <ErrorBoundary>
                        <BuyerDashboard />
                      </ErrorBoundary>
                    } 
                  />

                  {/* Farmer Order Management Routes */}
                  <Route path="farmer/orders" element={<FarmerOrdersPage />} />
                  <Route path="farmer/orders/:id" element={<FarmerOrderDetailsPage />} />
                  <Route path="farmer/orders/:id/manage" element={<FarmerOrderDetailsPage />} />

                  {/* Catch-all for dashboard routes */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>

                {/* Admin Routes with Silent Auth */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <ErrorBoundary>
                        <AdminPanel />
                      </ErrorBoundary>
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/users" replace />} />
                  <Route path="users" element={<UserVerification />} />
                  <Route path="farms" element={<FarmVerification />} />
                  <Route path="*" element={<Navigate to="/admin/users" replace />} />
                </Route>

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 Fallback */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                      <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">Not Found</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-lg text-gray-600 mb-8">Page not found</p>
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </Router>
        </SilentAuthProvider>
        </StripeProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;