// components/dashboard/Dashboard.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import Profile from './Profile';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';
import FarmManagement from '../farm/FarmManagement';
import ProductsDashboard from '../products/ProductDashboard';
import CreateProductPage from '../products/CreateProductPage';
import EditProductPage from '../products/EditProductPage';

// ---- ORDER COMPONENTS ----
import FarmerOrdersPage from '../orders/FarmerOrdersPage';
import FarmerOrderDetailsPage from '../orders/FarmerOrderDetailsPage';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        {/* Default dashboard home */}
        <Route index element={<DashboardHome />} />

        {/* Profile */}
        <Route path="profile" element={<Profile />} />

        {/* Farm Management (nested) */}
        <Route path="farms/*" element={<FarmManagement />} />

        {/* Product Management */}
        <Route path="products" element={<ProductsDashboard />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/edit/:id" element={<EditProductPage />} />

        {/* Role-specific Dashboards */}
        <Route path="farmer" element={<FarmerDashboard />} />
        <Route path="buyer" element={<BuyerDashboard />} />

        {/* --------------------------------------------------- */}
        {/* FARMER ORDER ROUTES – THIS IS THE MISSING PART */}
        {/* --------------------------------------------------- */}
        <Route path="farmer/orders" element={<FarmerOrdersPage />} />
        <Route path="farmer/orders/:id" element={<FarmerOrderDetailsPage />} />
        <Route path="farmer/orders/:id/manage" element={<FarmerOrderDetailsPage />} />

        {/* Catch-all – redirect unknown dashboard paths */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;