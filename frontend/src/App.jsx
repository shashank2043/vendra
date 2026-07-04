import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/Toast';
import GlobalLoader from './components/Loader';
import { setToken, loginSuccess, logoutSuccess } from './redux/slices/authSlice';
import api from './services/api';

const App = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  // Perform silent refresh on application startup to restore session from cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Ping refresh endpoint. If refresh token cookie exists, we get new access token
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data.data;
        
        // Load user profile with new access token
        const profile = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        dispatch(loginSuccess({
          accessToken,
          user: profile.data.data
        }));
      } catch (e) {
        console.log('No active session found on startup.');
        dispatch(logoutSuccess());
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (initializing) {
    // Elegant center loading screen during boot initialization
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0b0f19',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#9ca3af', letterSpacing: '1px' }}>INITIALIZING CONSOLE</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toast />
      <GlobalLoader />
    </BrowserRouter>
  );
};

export default App;
