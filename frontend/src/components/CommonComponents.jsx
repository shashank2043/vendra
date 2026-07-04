import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import Logout from '@mui/icons-material/Logout';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Warning from '@mui/icons-material/Warning';
import Inbox from '@mui/icons-material/Inbox';

// 1. Password Field with Visibility Toggle
export const PasswordField = ({ label = 'Password', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      label={label}
      fullWidth
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

// 2. Search Box with Clear Button
export const SearchBox = ({ value, onChange, placeholder = 'Search...', ...props }) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      variant="outlined"
      sx={{ minWidth: 260 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange({ target: { value: '' } })} edge="end">
              <Close fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
};

// 3. Status Badge with Theme-matching Palette Colors
export const StatusBadge = ({ status, ...props }) => {
  const normalized = status ? status.toUpperCase() : 'PENDING';
  
  let color = 'default';
  if (['ACTIVE', 'SENT', 'SUCCESS', 'COMPLETED', 'ADMIN'].includes(normalized)) color = 'success';
  else if (['PENDING', 'WARNING', 'USER'].includes(normalized)) color = 'warning';
  else if (['INACTIVE', 'FAILED', 'ERROR', 'DISABLED'].includes(normalized)) color = 'error';

  return (
    <Chip
      label={status}
      color={color}
      size="small"
      variant="soft"
      sx={{
        fontWeight: 600,
        borderRadius: '6px',
        fontFamily: 'inherit',
        px: 0.5,
        backgroundColor: (theme) => {
          if (color === 'success') return theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(237, 247, 237, 1)';
          if (color === 'warning') return theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.2)' : 'rgba(255, 244, 229, 1)';
          if (color === 'error') return theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(253, 237, 237, 1)';
          return undefined;
        },
        color: (theme) => {
          if (color === 'success') return theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark;
          if (color === 'warning') return theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark;
          if (color === 'error') return theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark;
          return undefined;
        }
      }}
      {...props}
    />
  );
};

// 4. Confirmation Dialog
export const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { borderRadius: '16px', px: 1, py: 0.5 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
        <Warning color="warning" />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 5. User Profile Menu Dropdown
export const ProfileMenu = ({ user, onLogout, onNavigateProfile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    if (onNavigateProfile) onNavigateProfile();
  };

  const handleLogoutClick = () => {
    handleClose();
    if (onLogout) onLogout();
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }} aria-controls={open ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700, fontSize: '0.95rem' }}>{initial}</Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 5px 15px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 220,
            borderRadius: '12px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.username || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email || 'user@vendra.com'}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileClick} sx={{ py: 1 }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile Details
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main', py: 1 }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};

// 6. Skeleton Loader Blocks
export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Box key={index} sx={{ my: 2 }}>
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '40%' }} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px', my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" sx={{ width: '20%' }} />
          </Box>
          {index < count - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  );
};

// 7. Reusable Empty State panel
export const EmptyState = ({ title = 'No Data Available', description = 'There is currently no data in this workspace.', onAction, actionText }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2, textAlign: 'center' }}>
      <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', borderRadius: '50%', p: 3, mb: 2 }}>
        <Inbox sx={{ fontSize: 50, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {description}
      </Typography>
      {onAction && actionText && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
