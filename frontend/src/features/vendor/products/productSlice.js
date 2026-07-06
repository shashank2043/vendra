import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorProducts = createAsyncThunk(
  'vendorProducts/fetchVendorProducts',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products?vendorId=${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor products');
    }
  }
);

// Inventory lives in a separate service; without an inventory record the order saga
// can't reserve stock and orders end up FAILED. Seed/update it alongside the product.
const syncInventory = async (productId, stock) => {
  try {
    if (productId != null && stock != null && Number(stock) >= 0) {
      await axiosInstance.post('/api/v1/inventory', {
        productId,
        quantity: Number(stock),
      });
    }
  } catch (e) {
    console.warn('Inventory sync failed:', e);
  }
};

export const createProduct = createAsyncThunk(
  'vendorProducts/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Backend assigns id and default moderation status.
      const response = await axiosInstance.post('/api/v1/products', productData);
      const created = response.data;
      await syncInventory(created?.id, productData.stock);
      return created;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'vendorProducts/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/products/${id}`, data);
      await syncInventory(id, data.stock);
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
      await axiosInstance.delete(`/api/v1/products/${id}`);
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
