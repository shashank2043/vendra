import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  active: false,
  message: '',
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startLoading: (state, action) => {
      state.active = true;
      state.message = action.payload || 'Loading...';
    },
    stopLoading: (state) => {
      state.active = false;
      state.message = '';
    },
  },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
