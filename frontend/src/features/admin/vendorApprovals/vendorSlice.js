import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchVendorApplications = createAsyncThunk(
  'adminVendors/fetchVendorApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/vendors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor applications');
    }
  }
);

export const approveVendor = createAsyncThunk(
  'adminVendors/approveVendor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/vendors/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to approve vendor');
    }
  }
);

export const rejectVendor = createAsyncThunk(
  'adminVendors/rejectVendor',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/vendors/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject vendor');
    }
  }
);

const initialState = {
  applications: [],
  loading: false,
  error: null,
};

const adminVendorSlice = createSlice({
  name: 'adminVendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchVendorApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load applications';
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        const index = state.applications.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        const index = state.applications.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      });
  },
});

export default adminVendorSlice.reducer;
