import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { store, persistor } from './app/store';
import getTheme from './theme/muiTheme';
import { useAppSelector } from './app/hooks';
import './index.css';

// Set up Google Client ID (configurable via environment variables)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1036306563630-placeholder.apps.googleusercontent.com';

const ThemeWrapper = ({ children }) => {
  const themeMode = useAppSelector((state) => state.auth.themeMode) || 'light';
  const activeTheme = getTheme(themeMode);
  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeWrapper>
            <App />
          </ThemeWrapper>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
