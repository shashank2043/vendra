import { createSlice } from '@reduxjs/toolkit';

// Light/dark UI theme mode, persisted so the choice survives reloads.
const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' },
  reducers: {
    toggleTheme: (state) => { state.mode = state.mode === 'light' ? 'dark' : 'light'; },
    setTheme: (state, action) => { state.mode = action.payload === 'dark' ? 'dark' : 'light'; },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = (state) => state.theme.mode;
export default themeSlice.reducer;
