import { createTheme } from '@mui/material/styles';

/**
 * Vendra Theme Palette Justification:
 * -------------------------------------
 * 1. Primary (#111827 - Obsidian Charcoal): A deep, grounding off-black in light mode. In dark mode, we invert this to white
 *    to preserve contrast, using deep slate as secondary backgrounds.
 * 2. Secondary (#C2A26F - Champagne Gold): A warm metallic champagne tone representing artisan distinction.
 * 3. Backgrounds: Soft print-evoking Alabaster (#FBFBFA) in light mode, and deep obsidian charcoal (#0B0F19) in dark mode.
 */
export const getTheme = (mode) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#FFFFFF' : '#111827',
        light: isDark ? '#F3F4F6' : '#374151',
        dark: isDark ? '#9CA3AF' : '#030712',
        contrastText: isDark ? '#111827' : '#FFFFFF',
      },
      secondary: {
        main: '#C2A26F',
        light: '#D3BC96',
        dark: '#A0814D',
        contrastText: '#111827',
      },
      background: {
        default: isDark ? '#0B0F19' : '#FBFBFA',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F9FAFB' : '#111827',
        secondary: isDark ? '#9CA3AF' : '#4B5563',
        disabled: isDark ? '#4B5563' : '#9CA3AF',
      },
      error: {
        main: '#BE123C', // Deep Crimson Rose
        light: '#FDA4AF',
        dark: '#9F1239',
      },
      warning: {
        main: '#D97706', // Editorial Amber
        light: '#FCD34D',
        dark: '#92400E',
      },
      info: {
        main: isDark ? '#38BDF8' : '#0369A1', // Premium Sky Blue
        light: '#7DD3FC',
        dark: '#0C4A6E',
      },
      success: {
        main: '#0F766E', // Editorial Teal
        light: '#99F6E4',
        dark: '#115E59',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.021em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.018em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.015em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.010em',
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: '-0.005em',
      },
      subtitle2: {
        fontWeight: 500,
      },
      body1: {
        letterSpacing: '-0.003em',
      },
      body2: {
        letterSpacing: '-0.003em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: isDark ? '#E5E7EB' : '#1F2937',
            },
          },
          outlinedPrimary: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(17, 24, 39, 0.04)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            '&:hover': {
              boxShadow: isDark ? '0 10px 30px 0 rgba(0,0,0,0.25)' : '0 10px 30px 0 rgba(0,0,0,0.06)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            color: isDark ? '#F9FAFB' : '#111827',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          }
        }
      }
    },
  });
};

export default getTheme;
