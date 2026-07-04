import React from 'react';
import { Badge, IconButton } from '@mui/material';
import { Bell } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';

const NotificationBell = ({ onClick }) => {
  const { notifications } = useAppSelector((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <IconButton
      color="inherit"
      onClick={onClick}
      aria-label={`${unreadCount} unread notifications`}
      sx={{
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    >
      <Badge 
        badgeContent={unreadCount} 
        color="error"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontWeight: 'bold',
            fontSize: '0.75rem',
            height: '18px',
            minWidth: '18px',
            backgroundColor: '#d32f2f', // Premium deep red
          }
        }}
      >
        <Bell size={22} />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;
