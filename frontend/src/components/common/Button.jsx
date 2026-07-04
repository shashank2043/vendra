import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({ children, loading, startIcon, ...props }) => {
  return (
    <MuiButton
      disabled={loading || props.disabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
