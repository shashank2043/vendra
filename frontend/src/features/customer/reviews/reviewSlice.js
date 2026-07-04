import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchReviewsByProduct = createAsyncThunk(
  'reviews/fetchReviewsByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews?productId=${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/reviews', reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load reviews';
      })
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit review';
      });
  }
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
