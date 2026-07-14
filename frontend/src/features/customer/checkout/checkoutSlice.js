import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  step: 0,
  address: {
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'United States'
  },
  paymentMethod: 'Razorpay',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    nextStep: (state) => {
      state.step = Math.min(state.step + 1, 2);
    },
    prevStep: (state) => {
      state.step = Math.max(state.step - 1, 0);
    },
    updateAddress: (state, action) => {
      state.address = { ...state.address, ...action.payload };
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    resetCheckout: (state) => {
      state.step = 0;
      state.address = {
        fullName: '',
        addressLine1: '',
        city: '',
        postalCode: '',
        country: 'United States'
      };
      state.paymentMethod = 'Razorpay';
    }
  }
});

export const { setStep, nextStep, prevStep, updateAddress, setPaymentMethod, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
