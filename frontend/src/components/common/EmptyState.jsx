import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ 
  icon: IconComponent, 
  title = 'No data found', 
  description = 'There is nothing to display here right now.', 
  actionText, 
  onActionClick 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {IconComponent && (
        <Box sx={{ color: 'text.disabled', mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent size={56} strokeWidth={1.5} />
        </Box>
      )}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        {description}
      </Typography>
      {actionText && onActionClick && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onActionClick}
          sx={{ px: 3, py: 1, borderRadius: '8px' }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
