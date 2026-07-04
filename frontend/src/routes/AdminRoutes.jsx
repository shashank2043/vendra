import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../pages/admin/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import VendorApprovalsPage from '../pages/admin/VendorApprovalsPage';
import ProductModerationPage from '../pages/admin/ProductModerationPage';
import OrdersPage from '../pages/admin/OrdersPage';
import CommissionRulesPage from '../pages/admin/CommissionRulesPage';
import DisputesPage from '../pages/admin/DisputesPage';
import ReportsPage from '../pages/admin/ReportsPage';
import UsersPage from '../pages/admin/UsersPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="" element={<DashboardPage />} />
        <Route path="vendor-approvals" element={<VendorApprovalsPage />} />
        <Route path="product-moderation" element={<ProductModerationPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="commission-rules" element={<CommissionRulesPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
