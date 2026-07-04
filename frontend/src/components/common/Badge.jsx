import React from 'react';
import { Box } from '@mui/material';

const Badge = ({ variant = 'default', children, ...props }) => {
  const getColors = () => {
    switch (variant.toLowerCase()) {
      case 'success':
      case 'approved':
      case 'completed':
      case 'delivered':
      case 'active':
        return { bg: 'rgba(15, 118, 110, 0.1)', color: '#0F766E' };
      case 'warning':
      case 'pending':
      case 'processing':
      case 'inactive':
        return { bg: 'rgba(217, 119, 6, 0.1)', color: '#D97706' };
      case 'error':
      case 'danger':
      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'suspended':
        return { bg: 'rgba(190, 18, 60, 0.1)', color: '#BE123C' };
      case 'info':
      case 'shipped':
        return { bg: 'rgba(3, 105, 161, 0.1)', color: '#0369A1' };
      case 'primary':
        return { bg: 'rgba(17, 24, 39, 0.08)', color: '#111827' };
      default:
        return { bg: '#F3F4F6', color: '#4B5563' };
    }
  };

  const { bg, color } = getColors();

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        width: 'fit-content',
        lineHeight: 1.2,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Badge;
