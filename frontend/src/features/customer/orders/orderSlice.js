import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';
import { clearCart } from '../cart/cartSlice';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders?userId=${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/orders', orderData);
      dispatch(clearCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to place order');
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Sort by newest first
        state.orders = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load orders';
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load order details';
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place order';
      });
  }
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
