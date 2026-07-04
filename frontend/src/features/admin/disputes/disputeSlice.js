import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchDisputes = createAsyncThunk(
  'adminDisputes/fetchDisputes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/disputes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch disputes');
    }
  }
);

export const resolveDispute = createAsyncThunk(
  'adminDisputes/resolveDispute',
  async ({ id, notes, resolutionStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/disputes/${id}`, { 
        status: resolutionStatus,
        resolutionNotes: notes 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to resolve dispute');
    }
  }
);

export const escalateDispute = createAsyncThunk(
  'adminDisputes/escalateDispute',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/disputes/${id}`, { status: 'ESCALATED' });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to escalate dispute');
    }
  }
);

const initialState = {
  disputes: [],
  loading: false,
  error: null,
};

const adminDisputeSlice = createSlice({
  name: 'adminDisputes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisputes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisputes.fulfilled, (state, action) => {
        state.loading = false;
        state.disputes = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .addCase(fetchDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load disputes';
      })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        const index = state.disputes.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.disputes[index] = action.payload;
        }
      })
      .addCase(escalateDispute.fulfilled, (state, action) => {
        const index = state.disputes.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.disputes[index] = action.payload;
        }
      });
  },
});

export default adminDisputeSlice.reducer;
