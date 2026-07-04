import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchInventory = createAsyncThunk(
  'vendorInventory/fetchInventory',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch inventory');
    }
  }
);

export const updateStock = createAsyncThunk(
  'vendorInventory/updateStock',
  async ({ productId, stock }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/products/${productId}`, { stock });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update stock');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const vendorInventorySlice = createSlice({
  name: 'vendorInventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load inventory';
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].stock = action.payload.stock;
        }
      });
  },
});

export default vendorInventorySlice.reducer;
