import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, Button, Divider, Tabs, Tab, TextField, Rating, IconButton, Card, CardContent, Avatar, Stack } from '@mui/material';
import { Heart, ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProductById, clearSelectedProduct } from '../../features/customer/products/productSlice';
import { toggleWishlist } from '../../features/customer/wishlist/wishlistSlice';
import { addToCart } from '../../features/customer/cart/cartSlice';
import { fetchReviewsByProduct, submitReview } from '../../features/customer/reviews/reviewSlice';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { selectedProduct: product, loading } = useAppSelector((state) => state.products);
  const { reviews } = useAppSelector((state) => state.reviews);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlist = useAppSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlist.includes(id);

  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [vendor, setVendor] = useState(null);
  const [eligibleToReview, setEligibleToReview] = useState(false);

  // Review Form States
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchReviewsByProduct(id));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  // Sync active image when product loads
  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrls?.[0] || '');
      
      // Fetch vendor details
      if (product.vendorId) {
        axiosInstance.get(`/api/v1/vendors/${product.vendorId}`)
          .then(res => setVendor(res.data))
          .catch(() => {});
      }
    }
  }, [product]);

  // Check eligibility to review
  useEffect(() => {
    if (isAuthenticated && user && product) {
      axiosInstance.get(`/api/v1/orders?userId=${user.id}&status=DELIVERED`)
        .then((res) => {
          const hasPurchased = (res.data || []).some(order =>
            (order.items || []).some(item => item.productId === product.id)
          );
          setEligibleToReview(hasPurchased);
        })
        .catch(err => console.error('Error checking review eligibility:', err));
    }
  }, [isAuthenticated, user, product]);

  if (loading || !product) {
    return <Spinner message="Loading product details..." height="400px" />;
  }

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product.id));
    if (isWishlisted) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userComment.trim()) {
      toast.error('Please enter a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    const reviewData = {
      productId: product.id,
      vendorId: product.vendorId,
      rating: userRating,
      comment: userComment.trim(),
    };

    try {
      await dispatch(submitReview(reviewData)).unwrap();
      toast.success('Review submitted successfully!');
      setUserComment('');
      setUserRating(5);
      dispatch(fetchReviewsByProduct(product.id));
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        component={RouterLink}
        to="/customer"
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Back to Gallery
      </Button>

      <Grid container spacing={5} sx={{ mb: 6 }}>
        {/* Left Side: Images */}
        <Grid item xs={12} md={6}>
          <Box 
            component="img"
            src={activeImage}
            alt={product.name}
            sx={{
              width: '100%',
              height: { xs: 320, sm: 480 },
              objectFit: 'cover',
              borderRadius: 3,
              mb: 2,
              border: '1px solid #E5E7EB'
            }}
          />
          {product.imageUrls && product.imageUrls.length > 1 && (
            <Grid container spacing={2}>
              {product.imageUrls.map((img, i) => (
                <Grid item xs={3} key={i}>
                  <Box
                    component="img"
                    src={img}
                    onClick={() => setActiveImage(img)}
                    sx={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: activeImage === img ? '2.5px solid' : '1px solid #E5E7EB',
                      borderColor: activeImage === img ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s',
                      opacity: activeImage === img ? 1 : 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Right Side: Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Vendor Name */}
            {vendor && (
              <Typography 
                component={RouterLink}
                to={`/customer/search?vendor=${vendor.id}`}
                variant="subtitle2" 
                fontWeight={700} 
                color="secondary.dark"
                sx={{ 
                  mb: 1, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {vendor.businessName}
              </Typography>
            )}

            {/* Product Title */}
            <Typography variant="h4" fontWeight={850} sx={{ mb: 2, letterSpacing: '-0.02em', color: 'primary.main' }}>
              {product.name}
            </Typography>

            {/* Rating summary */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Rating value={product.rating} readOnly precision={0.1} sx={{ color: '#C2A26F' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {product.rating} ({reviews.length} customer reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ mb: 3 }}>
              ${product.price}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              {product.description}
            </Typography>

            {/* Controls: Qty, Wishlist, Add to Cart */}
            <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Qty Selector */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1.5px solid #E5E7EB', 
                  borderRadius: '24px',
                  px: 1
                }}
              >
                <IconButton 
                  size="small"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </IconButton>
                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>
                  {quantity}
                </Typography>
                <IconButton 
                  size="small"
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus size={16} />
                </IconButton>
              </Box>

              {/* Add To Cart */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCart size={18} />}
                onClick={handleAddToCart}
                sx={{ 
                  borderRadius: '24px', 
                  px: 4,
                  py: 1.2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                Add to Cart
              </Button>

              {/* Wishlist Toggle */}
              <IconButton 
                onClick={handleWishlistToggle}
                sx={{ 
                  border: '1.5px solid #E5E7EB', 
                  p: 1.2,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                }}
              >
                <Heart 
                  size={20} 
                  color={isWishlisted ? '#BE123C' : '#6B7280'}
                  style={{ fill: isWishlisted ? '#BE123C' : 'none' }}
                />
              </IconButton>
            </Box>

            {/* Stock details */}
            <Typography variant="caption" color={product.stock > 0 ? 'success.main' : 'error.main'} fontWeight={650} sx={{ mt: 2.5, display: 'block', ml: 1 }}>
              {product.stock > 0 ? `${product.stock} items left in stock` : 'Out of stock'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs Description and Reviews */}
      <Box sx={{ width: '100%', mt: 6 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Description" sx={{ fontWeight: 700 }} />
          <Tab label={`Reviews (${reviews.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Tab content 0: Description */}
        {activeTab === 0 && (
          <Box sx={{ py: 2, px: 1 }}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {product.description}
            </Typography>
          </Box>
        )}

        {/* Tab content 1: Reviews */}
        {activeTab === 1 && (
          <Box sx={{ py: 2, px: 1 }}>
            <Grid container spacing={4}>
              {/* Review list */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Customer Reviews
                </Typography>
                {reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No reviews yet for this product.
                  </Typography>
                ) : (
                  <Stack spacing={3}>
                    {reviews.map((rev) => (
                      <Card key={rev.id} sx={{ p: 2.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                              {rev.userName ? rev.userName.charAt(0) : 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {rev.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                          <Rating value={rev.rating} readOnly size="small" sx={{ color: '#C2A26F' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {rev.comment}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Grid>

              {/* Write a review (Conditional) */}
              <Grid item xs={12} md={5}>
                {eligibleToReview ? (
                  <Card sx={{ p: 3, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Write a Review
                    </Typography>
                    <Box component="form" onSubmit={handleReviewSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          Your Rating
                        </Typography>
                        <Rating
                          value={userRating}
                          onChange={(e, val) => setUserRating(val || 5)}
                          size="large"
                          sx={{ color: '#C2A26F' }}
                        />
                      </Box>

                      <TextField
                        label="Your Review"
                        multiline
                        rows={4}
                        fullWidth
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Write your feedback..."
                        required
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submittingReview}
                        sx={{ borderRadius: '24px', py: 1, fontWeight: 700 }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  isAuthenticated && (
                    <Card sx={{ p: 3, border: '1px dashed #E5E7EB', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.01)', boxShadow: 'none' }}>
                      <Typography variant="subtitle2" fontWeight={750} color="text.secondary" sx={{ mb: 1 }}>
                        Review Restrained
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Only verified purchasers with a delivered order for this product are allowed to submit a review.
                      </Typography>
                    </Card>
                  )
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
