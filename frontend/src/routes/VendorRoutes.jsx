import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

import VendorLayout from '../pages/vendor/VendorLayout';
import DashboardPage from '../pages/vendor/DashboardPage';
import ProductsPage from '../pages/vendor/ProductsPage';
import InventoryPage from '../pages/vendor/InventoryPage';
import OrdersPage from '../pages/vendor/OrdersPage';
import AnalyticsPage from '../pages/vendor/AnalyticsPage';
import EarningsPage from '../pages/vendor/EarningsPage';
import TrustScorePage from '../pages/vendor/TrustScorePage';
import ReviewsPage from '../pages/vendor/ReviewsPage';
import VendorProfilePage from '../pages/vendor/VendorProfilePage';

// Guard for routes that require an APPROVED status
const ApprovedVendorGuard = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.approvalStatus !== 'APPROVED') {
    // If pending approval, lock access to all dashboards and redirect to profile settings
    return <Navigate to="/vendor/profile" replace />;
  }

  return children;
};

const VendorRoutes = () => {
  return (
    <Routes>
      <Route element={<VendorLayout />}>
        {/* Profile settings is accessible to pending vendors to let them complete setup */}
        <Route path="profile" element={<VendorProfilePage />} />

        {/* Dashboard and onboarding views require verified status */}
        <Route
          path=""
          element={
            <ApprovedVendorGuard>
              <DashboardPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="products"
          element={
            <ApprovedVendorGuard>
              <ProductsPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="inventory"
          element={
            <ApprovedVendorGuard>
              <InventoryPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="orders"
          element={
            <ApprovedVendorGuard>
              <OrdersPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="analytics"
          element={
            <ApprovedVendorGuard>
              <AnalyticsPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="earnings"
          element={
            <ApprovedVendorGuard>
              <EarningsPage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="trust-score"
          element={
            <ApprovedVendorGuard>
              <TrustScorePage />
            </ApprovedVendorGuard>
          }
        />
        <Route
          path="reviews"
          element={
            <ApprovedVendorGuard>
              <ReviewsPage />
            </ApprovedVendorGuard>
          }
        />
      </Route>
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default VendorRoutes;
