import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorProducts = createAsyncThunk(
  'vendorProducts/fetchVendorProducts',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'vendorProducts/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Default new products to PENDING moderation status
      const payload = {
        ...productData,
        moderationStatus: 'PENDING',
        rating: 5.0,
        id: `prod-${Date.now()}`
      };
      const response = await axiosInstance.post('/products', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'vendorProducts/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'vendorProducts/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const vendorProductSlice = createSlice({
  name: 'vendorProducts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      });
  },
});

export default vendorProductSlice.reducer;
