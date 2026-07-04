import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchModerationQueue = createAsyncThunk(
  'adminModeration/fetchModerationQueue',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all products including unapproved ones for the moderation queue.
      const response = await axiosInstance.get('/api/v1/products?approved=false');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch moderation queue');
    }
  }
);

export const approveProduct = createAsyncThunk(
  'adminModeration/approveProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/v1/products/${id}/moderate?approved=true`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to approve product');
    }
  }
);

export const rejectProduct = createAsyncThunk(
  'adminModeration/rejectProduct',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/products/${id}/moderate?approved=false&comment=${encodeURIComponent(reason || '')}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject product');
    }
  }
);

const initialState = {
  queue: [],
  loading: false,
  error: null,
};

const adminModerationSlice = createSlice({
  name: 'adminModeration',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModerationQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModerationQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.queue = action.payload;
      })
      .addCase(fetchModerationQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load moderation queue';
      })
      .addCase(approveProduct.fulfilled, (state, action) => {
        const index = state.queue.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.queue[index] = action.payload;
        }
      })
      .addCase(rejectProduct.fulfilled, (state, action) => {
        const index = state.queue.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.queue[index] = action.payload;
        }
      });
  },
});

export default adminModerationSlice.reducer;
