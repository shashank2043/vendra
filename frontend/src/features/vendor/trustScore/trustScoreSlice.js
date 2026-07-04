import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchTrustScore = createAsyncThunk(
  'vendorTrustScore/fetchTrustScore',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/trustScores?vendorId=${vendorId}`);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return { score: 100, fulfillmentRate: 100, avgDeliveryDelay: 0, complaintRatio: 0 };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trust score');
    }
  }
);

const initialState = {
  scoreData: null,
  loading: false,
  error: null,
};

const vendorTrustScoreSlice = createSlice({
  name: 'vendorTrustScore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrustScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrustScore.fulfilled, (state, action) => {
        state.loading = false;
        state.scoreData = action.payload;
      })
      .addCase(fetchTrustScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load trust score';
      });
  },
});

export default vendorTrustScoreSlice.reducer;
