import React from 'react';
import { Grid, Skeleton, Box } from '@mui/material';
import ProductCard from './ProductCard';
import EmptyState from '../../../components/common/EmptyState';
import { ShoppingBag } from 'lucide-react';

const ProductGrid = ({ products, loading, emptyTitle, emptyDescription }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(8)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Skeleton variant="rectangular" width="100%" sx={{ pt: '100%', borderRadius: 2 }} />
              <Skeleton width="40%" sx={{ mt: 1.5 }} />
              <Skeleton width="80%" sx={{ mt: 0.5 }} />
              <Skeleton width="50%" sx={{ mt: 1 }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={emptyTitle || 'No products found'}
        description={emptyDescription || 'Try adjusting your search terms or filters.'}
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
