import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Container, Grid, Typography, Button, useMediaQuery } from '@mui/material';
import { Filter } from 'lucide-react';
import { Offcanvas } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from '../../features/customer/products/productSlice';
import ProductGrid from '../../features/customer/products/ProductGrid';
import ProductFilters from '../../features/customer/products/ProductFilters';
import axiosInstance from '../../api/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css'; // Load bootstrap css for Offcanvas layout support

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);

  const q = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialVendor = searchParams.get('vendor') || '';

  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter States
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
    axiosInstance.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, [dispatch]);

  // Sync category param from home or navbar
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 300]);
    setMinRating(0);
    setSearchParams({});
  };

  // Perform filtering
  const filteredProducts = products.filter(product => {
    if (q) {
      const query = q.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesDesc = product.description?.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) return false;
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
      return false;
    }

    if (initialVendor && product.vendorId !== initialVendor) {
      return false;
    }

    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    if (minRating > 0 && product.rating < minRating) {
      return false;
    }

    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.main">
            {q ? `Search Results for "${q}"` : 'Explore Collections'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProducts.length} items
          </Typography>
        </Box>
        {!isDesktop && (
          <Button
            variant="outlined"
            onClick={() => setMobileFiltersOpen(true)}
            startIcon={<Filter size={16} />}
            sx={{ borderRadius: '20px', borderColor: 'divider' }}
          >
            Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Desktop Sidebar Filters */}
        {isDesktop && (
          <Grid item md={3}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', position: 'sticky', top: 90 }}>
              <ProductFilters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onClear={handleClearFilters}
              />
            </Box>
          </Grid>
        )}

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          <ProductGrid products={filteredProducts} loading={loading} />
        </Grid>
      </Grid>

      {/* Mobile Offcanvas Filters using React-Bootstrap */}
      {!isDesktop && (
        <Offcanvas show={mobileFiltersOpen} onHide={() => setMobileFiltersOpen(false)} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title style={{ fontWeight: 700 }}>Filters</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <ProductFilters
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              onClear={handleClearFilters}
            />
          </Offcanvas.Body>
        </Offcanvas>
      )}
    </Container>
  );
};

export default SearchResultsPage;
