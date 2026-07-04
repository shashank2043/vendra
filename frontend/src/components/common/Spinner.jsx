import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Spinner = ({ message = 'Loading...', height = '200px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress color="secondary" size={40} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Spinner;
