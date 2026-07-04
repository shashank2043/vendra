import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

// The vendor's product catalogue (name, category, price...) comes from product-service,
// while live stock lives in inventory-service. We merge them so the page keeps working
// with product-shaped items that also carry a `stock` field.
export const fetchInventory = createAsyncThunk(
  'vendorInventory/fetchInventory',
  async (vendorId, { rejectWithValue }) => {
    try {
      const [productsRes, stockRes] = await Promise.all([
        axiosInstance.get(`/api/v1/products?vendorId=${vendorId}`),
        axiosInstance.get('/api/v1/inventory/my-stock').catch(() => ({ data: [] })),
      ]);
      const products = productsRes.data || [];
      const stockList = stockRes.data || [];
      const stockByProduct = {};
      stockList.forEach((s) => {
        // Show sellable (available) stock so reservations from sales are reflected.
        stockByProduct[s.productId] = s.availableQuantity !== undefined ? s.availableQuantity : s.quantity;
      });
      return products.map((p) => ({
        ...p,
        stock: stockByProduct[p.id] !== undefined ? stockByProduct[p.id] : p.stock,
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch inventory');
    }
  }
);

export const updateStock = createAsyncThunk(
  'vendorInventory/updateStock',
  async ({ productId, stock }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/inventory', {
        productId,
        quantity: stock,
      });
      const data = response.data || {};
      return { productId, stock: data.quantity !== undefined ? data.quantity : stock };
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
        const index = state.items.findIndex(item => item.id === action.payload.productId);
        if (index !== -1) {
          state.items[index].stock = action.payload.stock;
        }
      });
  },
});

export default vendorInventorySlice.reducer;
