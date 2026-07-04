import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import ProtectedRoute from '../guards/ProtectedRoute';
import RoleRoute from '../guards/RoleRoute';

import LoginPage from '../pages/LoginPage';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import PendingApprovalPage from '../pages/PendingApprovalPage';

import CustomerRoutes from './CustomerRoutes';
import VendorRoutes from './VendorRoutes';
import AdminRoutes from './AdminRoutes';

const HomeRedirect = () => {
  const { isAuthenticated, role, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (role === 'VENDOR') {
    if (user?.approvalStatus !== 'APPROVED') {
      return <Navigate to="/pending-approval" replace />;
    }
    return <Navigate to="/vendor" replace />;
  } else {
    return <Navigate to="/customer" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Portal Root Redirect */}
        <Route path="/" element={<HomeRedirect />} />
        
        {/* Pending Approval Page */}
        <Route 
          path="/pending-approval" 
          element={
            <RoleRoute allowedRoles={['VENDOR']}>
              <PendingApprovalPage />
            </RoleRoute>
          } 
        />

        {/* Customer Portal Routes */}
        <Route 
          path="/customer/*" 
          element={
            <RoleRoute allowedRoles={['CUSTOMER']}>
              <CustomerRoutes />
            </RoleRoute>
          } 
        />

        {/* Vendor Portal Routes */}
        <Route 
          path="/vendor/*" 
          element={
            <RoleRoute allowedRoles={['VENDOR']}>
              <VendorRoutes />
            </RoleRoute>
          } 
        />

        {/* Admin Portal Routes */}
        <Route 
          path="/admin/*" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminRoutes />
            </RoleRoute>
          } 
        />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
