import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchPlatformUsers = createAsyncThunk(
  'adminUsers/fetchPlatformUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch platform users');
    }
  }
);

export const suspendUser = createAsyncThunk(
  'adminUsers/suspendUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/admin/users/${id}`, { suspended: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to suspend user');
    }
  }
);

export const reactivateUser = createAsyncThunk(
  'adminUsers/reactivateUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/admin/users/${id}`, { suspended: false });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reactivate user');
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchPlatformUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load users';
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default adminUserSlice.reducer;
