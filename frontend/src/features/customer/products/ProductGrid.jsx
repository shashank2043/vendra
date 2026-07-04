import React, { useEffect, useState } from 'react';
import { Grid, Skeleton, Box } from '@mui/material';
import ProductCard from './ProductCard';
import EmptyState from '../../../components/common/EmptyState';
import { ShoppingBag } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';

const ProductGrid = ({ products, loading, emptyTitle, emptyDescription }) => {
  // Aggregate review scores per product so each card shows a real average rating.
  // (The product record itself does not store an aggregate rating.)
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    axiosInstance.get('/api/v1/reviews')
      .then((res) => {
        const agg = {};
        (res.data || []).forEach((r) => {
          if (!r.productId) return;
          if (!agg[r.productId]) agg[r.productId] = { sum: 0, count: 0 };
          agg[r.productId].sum += Number(r.rating) || 0;
          agg[r.productId].count += 1;
        });
        const map = {};
        Object.entries(agg).forEach(([pid, { sum, count }]) => {
          map[pid] = { rating: count ? sum / count : 0, reviewCount: count };
        });
        setRatings(map);
      })
      .catch(() => {});
  }, []);

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
      {products.map((product) => {
        const agg = ratings[product.id];
        const enriched = agg
          ? { ...product, rating: agg.rating, reviewCount: agg.reviewCount }
          : product;
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={enriched} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProductGrid;
