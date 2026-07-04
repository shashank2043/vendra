import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Try to read theme from local storage (theme mode only is fine for local persistence)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved || 'dark';
  });

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    
    return createTheme({
      palette: {
        mode,
        primary: {
          main: '#6366f1', // Indigo
          light: '#818cf8',
          dark: '#4338ca',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ec4899', // Pink
          light: '#f472b6',
          dark: '#be185d',
          contrastText: '#ffffff',
        },
        background: {
          default: isDark ? '#0b0f19' : '#f8fafc',
          paper: isDark ? '#111827' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f3f4f6' : '#1e293b',
          secondary: isDark ? '#9ca3af' : '#64748b',
          disabled: isDark ? '#4b5563' : '#94a3b8',
        },
        divider: isDark ? '#1f2937' : '#e2e8f0',
      },
      typography: {
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h1: { fontSize: '2.5rem', fontWeight: 800 },
        h2: { fontSize: '2rem', fontWeight: 700 },
        h3: { fontSize: '1.75rem', fontWeight: 700 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        subtitle1: { fontSize: '1rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '1rem', lineHeight: 1.5 },
        body2: { fontSize: '0.875rem', lineHeight: 1.43 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '8px',
              padding: '8px 16px',
              transition: 'all 0.2s ease-in-out',
              boxShadow: 'none',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              },
            },
            containedSecondary: {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '16px',
              backgroundImage: 'none',
              border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '0 4px 20px 0 rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px 0 rgba(148, 163, 184, 0.05)',
              backgroundColor: isDark ? '#111827' : '#ffffff',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
              color: isDark ? '#f3f4f6' : '#1e293b',
              boxShadow: 'none',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              fontWeight: 700,
              backgroundColor: isDark ? '#161d2a' : '#f8fafc',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
