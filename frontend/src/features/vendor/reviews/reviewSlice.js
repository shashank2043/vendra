import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorReviews = createAsyncThunk(
  'vendorReviews/fetchVendorReviews',
  async (vendorId, { rejectWithValue }) => {
    try {
      // 1. Fetch all products of this vendor to get product IDs
      const productsRes = await axiosInstance.get(`/products?vendorId=${vendorId}`);
      const productIds = productsRes.data.map(p => p.id);

      // 2. Fetch all reviews
      const reviewsRes = await axiosInstance.get('/reviews');

      // 3. Filter reviews that match product IDs
      const filteredReviews = reviewsRes.data.filter(r => productIds.includes(r.productId));
      return filteredReviews;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor reviews');
    }
  }
);

export const postReply = createAsyncThunk(
  'vendorReviews/postReply',
  async ({ reviewId, reply }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/reviews/${reviewId}`, { reply });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to post reply');
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const vendorReviewSlice = createSlice({
  name: 'vendorReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchVendorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load reviews';
      })
      .addCase(postReply.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index].reply = action.payload.reply;
        }
      });
  },
});

export default vendorReviewSlice.reducer;
