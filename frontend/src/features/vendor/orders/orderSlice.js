import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorOrders = createAsyncThunk(
  'vendorOrders/fetchVendorOrders',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'vendorOrders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const vendorOrderSlice = createSlice({
  name: 'vendorOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load orders';
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
      });
  },
});

export default vendorOrderSlice.reducer;
