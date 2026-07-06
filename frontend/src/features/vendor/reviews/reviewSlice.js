import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorReviews = createAsyncThunk(
  'vendorReviews/fetchVendorReviews',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor reviews');
    }
  }
);

export const postReply = createAsyncThunk(
  'vendorReviews/postReply',
  async ({ reviewId, reply }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/reviews/${reviewId}`, { reply });
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
