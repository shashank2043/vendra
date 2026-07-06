import React, { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, Button, Fade } from '@mui/material';
import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toggleWishlist } from '../wishlist/wishlistSlice';
import { addToCart } from '../cart/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../../../components/common/Rating';
import axiosInstance from '../../../api/axiosInstance';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlist.includes(product.id);
  const [hovered, setHovered] = useState(false);
  const [vendorName, setVendorName] = useState('Artisanal Seller');

  useEffect(() => {
    let active = true;
    if (product.vendorId) {
      axiosInstance.get(`/api/v1/vendors/${product.vendorId}`)
        .then(res => {
          if (active && res.data && res.data.businessName) {
            setVendorName(res.data.businessName);
          }
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [product.vendorId]);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleWishlist(product.id));
    if (isWishlisted) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/customer/product/${product.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Wishlist Toggle Button */}
      <IconButton
        onClick={handleWishlistToggle}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Heart
          size={18}
          color={isWishlisted ? '#BE123C' : '#6B7280'}
          style={{ fill: isWishlisted ? '#BE123C' : 'none' }}
        />
      </IconButton>

      {/* Product Image Media Container */}
      <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={product.imageUrl || product.imageUrls?.[0] || 'https://placehold.co/600x600?text=No+Image'}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />

        {/* Quick Add Overlay */}
        <Fade in={hovered}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              zIndex: 5,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              startIcon={<ShoppingCart size={16} />}
              fullWidth
              sx={{
                py: 1,
                fontSize: '0.8rem',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Quick Add
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Card Content Details */}
      <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Vendor */}
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {vendorName}
        </Typography>

        {/* Title */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: 'text.primary', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </Typography>

        {/* Price & Rating */}
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={800} color="primary.main">
            ${product.price}
          </Typography>
          <Rating value={product.rating} readOnly size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
