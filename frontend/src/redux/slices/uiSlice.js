import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  currentRouteTitle: 'Dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setRouteTitle: (state, action) => {
      state.currentRouteTitle = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setRouteTitle } = uiSlice.actions;
export default uiSlice.reducer;
