import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';
import App from './App';
import { store, persistor } from './app/store';
import getTheme from './theme/muiTheme';
import { selectThemeMode } from './features/theme/themeSlice';
import './index.css';

// Theme mode is driven by the persisted `theme` slice and toggled from the topbar.
const ThemeWrapper = ({ children }) => {
  const mode = useSelector(selectThemeMode);
  const activeTheme = getTheme(mode);
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
