import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ConfirmDialog = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  isDestructive = true
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onCancel}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: 1,
        }
      }}
    >
      <DialogTitle fontWeight={700} sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="text.secondary">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit" sx={{ fontWeight: 600 }}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={isDestructive ? 'error' : 'primary'}
          sx={{ fontWeight: 600 }}
          autoFocus
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
