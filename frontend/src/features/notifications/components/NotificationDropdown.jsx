import React from 'react';
import { Menu, MenuItem, Typography, Button, Box, Divider, List, ListItem, ListItemText } from '@mui/material';
import { CheckCheck, BellOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { markAsRead, markAllAsRead } from '../notificationSlice';

const NotificationDropdown = ({ anchorEl, open, onClose }) => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead(notifications));
  };

  const handleItemClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            mt: 1.5,
            boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '12px',
          }
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary' }}>
          Notifications
        </Typography>
        {unreadNotifications.length > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllRead}
            startIcon={<CheckCheck size={16} />}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
          >
            Mark all read
          </Button>
        )}
      </Box>
      <Divider />

      {/* Notifications List */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
            <BellOff size={36} color="#ccc" style={{ marginBottom: '12px' }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              All caught up!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              No new notifications for you right now.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                sx={{
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                  },
                  px: 2,
                  py: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      fontWeight={notification.read ? 400 : 600} 
                      color="text.primary"
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {formatTime(notification.createdAt)}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      mt: 1,
                      ml: 1,
                      flexShrink: 0
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Menu>
  );
};

export default NotificationDropdown;
