import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchReportsSummary = createAsyncThunk(
  'adminReports/fetchReportsSummary',
  async (_, { rejectWithValue }) => {
    try {
      // Single aggregated report from the backend.
      const response = await axiosInstance.get('/api/v1/reports/admin');
      const data = response.data || {};
      return {
        revenueTrend: data.revenueTrend || [],
        topVendors: data.topVendors || [],
        slaCompliance: data.slaCompliance ?? 100,
        disputesCount: data.disputesCount ?? 0,
        ...data,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reports summary');
    }
  }
);

const initialState = {
  summary: null,
  loading: false,
  error: null,
};

const adminReportSlice = createSlice({
  name: 'adminReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchReportsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load reports';
      });
  },
});

export default adminReportSlice.reducer;
