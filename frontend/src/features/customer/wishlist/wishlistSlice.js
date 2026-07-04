import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productIds: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const productId = action.payload;
      const index = state.productIds.indexOf(productId);
      if (index !== -1) {
        state.productIds.splice(index, 1);
      } else {
        state.productIds.push(productId);
      }
    },
    clearWishlist: (state) => {
      state.productIds = [];
    }
  }
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
