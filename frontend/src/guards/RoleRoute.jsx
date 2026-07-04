import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (!allowedRoles.includes(role)) {
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
  }

  // Additional check: if user is VENDOR but not approved, and this is NOT already the pending-approval page
  if (role === 'VENDOR' && user?.approvalStatus !== 'APPROVED') {
    if (window.location.pathname.includes('/pending-approval')) {
      return children;
    }
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
};

export default RoleRoute;
