import React from 'react';
import { Rating as MuiRating, Box, Typography } from '@mui/material';
import { Star } from 'lucide-react';

const Rating = ({ value, onChange, readOnly = false, precision = 0.5, showLabel = false, ...props }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <MuiRating
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        precision={precision}
        icon={<Star size={18} style={{ fill: 'currentColor' }} />}
        emptyIcon={<Star size={18} />}
        sx={{
          color: '#C2A26F', // Matching secondary gold accent
          '& .MuiRating-icon': {
            mr: '2px',
          }
        }}
        {...props}
      />
      {showLabel && value !== undefined && (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          ({Number(value).toFixed(1)})
        </Typography>
      )}
    </Box>
  );
};

export default Rating;
