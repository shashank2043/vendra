import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useNotificationPolling from './hooks/useNotificationPolling';

// Scroll to top utility component that fires on every route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  
  return null;
};

// Poller component to call the notifications hook in the React tree
const NotificationPoller = () => {
  useNotificationPolling();
  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NotificationPoller />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

export default App;
