import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Avatar, Grid, Stack } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from '../../features/customer/products/productSlice';
import ProductGrid from '../../features/customer/products/ProductGrid';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts());
    
    Promise.all([
      axiosInstance.get('/api/v1/categories'),
      axiosInstance.get('/api/v1/vendors?approvalStatus=APPROVED')
    ]).then(([catRes, vendorRes]) => {
      setCategories(catRes.data);
      setVendors(vendorRes.data);
    }).catch(err => {
      console.error('Error fetching home page data:', err);
    }).finally(() => {
      setDataLoading(false);
    });
  }, [dispatch]);

  const handleCategoryClick = (catId) => {
    navigate(`/customer/search?category=${catId}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Editorial Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(17, 24, 39, 0.75), rgba(28, 25, 23, 0.85)), url(/images/vendra_hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          py: { xs: 8, md: 15 },
          px: 2,
          textAlign: 'center',
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              letterSpacing: '-0.04em',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.1,
            }}
          >
            Curated Objects for <br />
            <Box component="span" sx={{ color: 'secondary.main' }}>
              Refined Living
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'grey.400',
              fontWeight: 400,
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Discover hand-crafted essentials, high-end stationery, and artisanal food directly from independent makers.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/customer/search')}
            endIcon={<ArrowRight size={18} />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '30px',
              fontWeight: 700,
              boxShadow: '0 10px 20px rgba(194, 162, 111, 0.2)',
            }}
          >
            Explore Collections
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Categories Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 4, letterSpacing: '-0.02em' }}>
            Browse Categories
          </Typography>
          {dataLoading ? (
            <Spinner height="100px" />
          ) : (
            <Grid container spacing={3}>
              {categories.map((cat) => (
                <Grid item xs={6} sm={3} key={cat.id}>
                  <Card
                    onClick={() => handleCategoryClick(cat.name)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      pt: '75%',
                      border: 'none',
                      boxShadow: 'none',
                      '&:hover img': {
                        transform: 'scale(1.08)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={cat.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(cat.name)}/600/450`}
                      alt={cat.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          `data:image/svg+xml,${encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="#C2A26F"/></svg>'
                          )}`;
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        color: '#ffffff',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>
                        {cat.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Featured Vendors Row */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Meet the Artisans
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Direct partnerships with independent stores, supporting slow production and local craft.
          </Typography>
          {dataLoading ? (
            <Spinner height="100px" />
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                overflowX: 'auto', 
                pb: 2, 
                px: 0.5,
                scrollBehavior: 'smooth',
                '::-webkit-scrollbar': { height: 6 },
                '::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3 }
              }}
            >
              {vendors.map((vendor) => (
                <Card 
                  key={vendor.id}
                  sx={{ 
                    minWidth: 280, 
                    maxWidth: 320,
                    borderRadius: 3, 
                    flexShrink: 0,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar 
                        src={vendor.logoUrl || ''} 
                        alt={vendor.businessName}
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: 'secondary.main', 
                          color: '#ffffff',
                          fontWeight: 700 
                        }}
                      >
                        {vendor.businessName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                          {vendor.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Verified Partner
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, lineClamp: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {vendor.description || 'Striving for premium products crafted by local designers.'}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small" 
                      onClick={() => navigate(`/customer/search?vendor=${vendor.id}`)}
                      sx={{ mt: 'auto', borderRadius: '20px' }}
                    >
                      Visit Shop
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Featured Products Section */}
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 4, letterSpacing: '-0.02em' }}>
            Trending Objects
          </Typography>
          <ProductGrid products={products.slice(0, 8)} loading={loading} />
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
