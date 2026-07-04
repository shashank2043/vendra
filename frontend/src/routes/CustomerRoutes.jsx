import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../pages/customer/CustomerLayout';
import HomePage from '../pages/customer/HomePage';
import SearchResultsPage from '../pages/customer/SearchResultsPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import OrderTrackingPage from '../pages/customer/OrderTrackingPage';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="" element={<HomePage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/track/:id" element={<OrderTrackingPage />} />
      </Route>
      {/* Fallback customer route */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
