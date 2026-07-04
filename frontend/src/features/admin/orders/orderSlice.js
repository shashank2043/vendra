import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchAllOrders = createAsyncThunk(
  'adminOrders/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch platform orders');
    }
  }
);

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load platform orders';
      });
  },
});

export default adminOrderSlice.reducer;
