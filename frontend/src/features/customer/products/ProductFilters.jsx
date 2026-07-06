import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, Slider, Button, Divider, Rating } from '@mui/material';
import { RefreshCw } from 'lucide-react';

const ProductFilters = ({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 300,
  minRating,
  onMinRatingChange,
  onClear
}) => {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header and Reset */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
        <Button 
          variant="text" 
          size="small" 
          onClick={onClear}
          startIcon={<RefreshCw size={14} />}
          sx={{ textTransform: 'none', color: 'secondary.dark', fontWeight: 600 }}
        >
          Reset
        </Button>
      </Box>
      <Divider />

      {/* Categories Checkbox Group */}
      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {categories.map((cat) => (
            <FormControlLabel
              key={cat.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={() => onCategoryChange(cat.name)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">{cat.name}</Typography>}
            />
          ))}
        </Box>
      </Box>
      <Divider />

      {/* Price Slider */}
      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => onPriceRangeChange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={maxPrice}
          color="primary"
          sx={{ width: '90%', ml: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">${priceRange[0]}</Typography>
          <Typography variant="caption" color="text.secondary">${priceRange[1]}</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Star Ratings */}
      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Minimum Rating
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[5, 4, 3, 2].map((stars) => (
            <Button
              key={stars}
              variant="text"
              onClick={() => onMinRatingChange(stars)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 0.5,
                px: 1,
                borderRadius: 1,
                backgroundColor: minRating === stars ? 'action.selected' : 'transparent',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <Rating value={stars} readOnly size="small" sx={{ mr: 1, color: '#C2A26F' }} />
              <Typography variant="caption" fontWeight={minRating === stars ? 700 : 400}>
                &amp; Up
              </Typography>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductFilters;
