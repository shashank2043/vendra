import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectThemeMode, toggleTheme } from '../../features/theme/themeSlice';

// Light/dark theme switch, shared across customer, vendor and admin portals.
const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';
  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton color="inherit" onClick={() => dispatch(toggleTheme())} aria-label="toggle theme">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
