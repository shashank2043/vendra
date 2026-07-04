import React from 'react';
import { useSelector } from 'react-redux';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Global Backdrop Loader
export const GlobalLoader = () => {
  const { active, message } = useSelector((state) => state.loading);

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 9999,
        flexDirection: 'column',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(9, 13, 22, 0.7)'
      }}
      open={active}
    >
      <CircularProgress color="primary" size={50} />
      {message && (
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            fontWeight: 500,
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            fontFamily: 'inherit'
          }}
        >
          {message}
        </Typography>
      )}
    </Backdrop>
  );
};

// Inline circular loader
export const Spinner = ({ size = 40, color = 'primary', ...props }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={3} {...props}>
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

// Main export defaults to GlobalLoader
export default GlobalLoader;
