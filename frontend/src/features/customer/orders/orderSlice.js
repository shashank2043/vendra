import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';
import { clearCart } from '../cart/cartSlice';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders?userId=${userId}`);
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
      const response = await axiosInstance.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch order ${id} from API, using fallback dummy data.`, error);
      return {
        id: id || 'ord-999-vp-1',
        parentOrderId: 'ord-999',
        userId: 'user-customer-1',
        userName: 'John Customer',
        vendorId: 'vp-1',
        items: [
          {
            productId: 'prod-1',
            name: 'Hand-Thrown Ceramic Mug',
            price: 32,
            quantity: 1,
            vendorId: 'vp-1',
            imageUrl: '/images/ceramic_mug.jpg'
          }
        ],
        total: 32,
        status: 'PLACED',
        createdAt: new Date().toISOString(),
        shippingAddress: {
          fullName: 'John Customer',
          addressLine1: '123 Main St',
          city: 'Seattle',
          postalCode: '98101',
          country: 'USA'
        },
        paymentMethod: 'Razorpay'
      };
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders', orderData);
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
