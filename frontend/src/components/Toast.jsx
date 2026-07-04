import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { hideNotification } from '../redux/slices/notificationSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { open, message, severity, duration } = useSelector((state) => state.notification);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: '10px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          fontFamily: 'inherit'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
