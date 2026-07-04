import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notifications/notificationSlice';

// Customer Slices
import productsReducer from '../features/customer/products/productSlice';
import cartReducer from '../features/customer/cart/cartSlice';
import wishlistReducer from '../features/customer/wishlist/wishlistSlice';
import checkoutReducer from '../features/customer/checkout/checkoutSlice';
import ordersReducer from '../features/customer/orders/orderSlice';
import reviewsReducer from '../features/customer/reviews/reviewSlice';

// Vendor Slices
import vendorProductsReducer from '../features/vendor/products/productSlice';
import vendorInventoryReducer from '../features/vendor/inventory/inventorySlice';
import vendorOrdersReducer from '../features/vendor/orders/orderSlice';
import vendorAnalyticsReducer from '../features/vendor/analytics/analyticsSlice';
import vendorCommissionReducer from '../features/vendor/commission/commissionSlice';
import vendorTrustScoreReducer from '../features/vendor/trustScore/trustScoreSlice';
import vendorReviewsReducer from '../features/vendor/reviews/reviewSlice';

// Admin Slices
import adminVendorsReducer from '../features/admin/vendorApprovals/vendorSlice';
import adminModerationReducer from '../features/admin/productModeration/moderationSlice';
import adminOrdersReducer from '../features/admin/orders/orderSlice';
import adminCommissionReducer from '../features/admin/commissionRules/commissionSlice';
import adminDisputesReducer from '../features/admin/disputes/disputeSlice';
import adminReportsReducer from '../features/admin/reports/reportSlice';
import adminUsersReducer from '../features/admin/users/userSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'cart', 'wishlist'], // Slices to persist
};

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
  
  // Customer Portal
  products: productsReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
  reviews: reviewsReducer,

  // Vendor Portal
  vendorProducts: vendorProductsReducer,
  vendorInventory: vendorInventoryReducer,
  vendorOrders: vendorOrdersReducer,
  vendorAnalytics: vendorAnalyticsReducer,
  vendorCommission: vendorCommissionReducer,
  vendorTrustScore: vendorTrustScoreReducer,
  vendorReviews: vendorReviewsReducer,

  // Admin Portal
  adminVendors: adminVendorsReducer,
  adminModeration: adminModerationReducer,
  adminOrders: adminOrdersReducer,
  adminCommission: adminCommissionReducer,
  adminDisputes: adminDisputesReducer,
  adminReports: adminReportsReducer,
  adminUsers: adminUsersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
