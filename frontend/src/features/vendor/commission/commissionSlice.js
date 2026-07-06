import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchCommissionLedger = createAsyncThunk(
  'vendorCommission/fetchCommissionLedger',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/commission/ledger?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch commission ledger');
    }
  }
);

const initialState = {
  ledger: [],
  loading: false,
  error: null,
};

const vendorCommissionSlice = createSlice({
  name: 'vendorCommission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommissionLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommissionLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchCommissionLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load commission ledger';
      });
  },
});

export default vendorCommissionSlice.reducer;
