import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchAnalytics = createAsyncThunk(
  'vendorAnalytics/fetchAnalytics',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/analytics?vendorId=${vendorId}`);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return { salesOverTime: [], categoryBreakdown: [] };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  data: {
    salesOverTime: [],
    categoryBreakdown: []
  },
  loading: false,
  error: null,
};

const vendorAnalyticsSlice = createSlice({
  name: 'vendorAnalytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load analytics';
      });
  },
});

export default vendorAnalyticsSlice.reducer;
