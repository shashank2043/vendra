import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store, persistor } from './app/store';
import getTheme from './theme/muiTheme';
import './index.css';

// Light theme only (dark mode intentionally disabled per product decision).
const ThemeWrapper = ({ children }) => {
  const activeTheme = getTheme('light');
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
        <ThemeWrapper>
          <App />
        </ThemeWrapper>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
