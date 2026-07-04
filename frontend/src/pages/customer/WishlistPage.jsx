import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from '../../features/customer/products/productSlice';
import ProductGrid from '../../features/customer/products/ProductGrid';

const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Heart size={28} color="#BE123C" style={{ fill: '#BE123C' }} />
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          My Wishlist
        </Typography>
      </Box>

      <ProductGrid
        products={wishlistedProducts}
        loading={loading}
        emptyTitle="Your wishlist is empty"
        emptyDescription="Bookmark hand-crafted items you love to view them later."
      />
    </Container>
  );
};

export default WishlistPage;
