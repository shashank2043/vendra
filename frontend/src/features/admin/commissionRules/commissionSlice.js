import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchCommissionRules = createAsyncThunk(
  'adminCommission/fetchCommissionRules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/commission/rules');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch commission rules');
    }
  }
);

export const createCommissionRule = createAsyncThunk(
  'adminCommission/createCommissionRule',
  async (ruleData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/commission/rules', ruleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create commission rule');
    }
  }
);

export const updateCommissionRule = createAsyncThunk(
  'adminCommission/updateCommissionRule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/commission/rules/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update commission rule');
    }
  }
);

const initialState = {
  rules: [],
  loading: false,
  error: null,
};

const adminCommissionSlice = createSlice({
  name: 'adminCommission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommissionRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommissionRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchCommissionRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load commission rules';
      })
      .addCase(createCommissionRule.fulfilled, (state, action) => {
        state.rules.push(action.payload);
      })
      .addCase(updateCommissionRule.fulfilled, (state, action) => {
        const index = state.rules.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.rules[index] = action.payload;
        }
      });
  },
});

export default adminCommissionSlice.reducer;
