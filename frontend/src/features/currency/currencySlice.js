import { createSlice } from '@reduxjs/toolkit';

// Product prices are authored in USD; these are platform-maintained conversion rates
// (Amazon-style — not a live feed, which keeps checkout deterministic and offline-safe).
export const RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 157,
  CAD: 1.36, AUD: 1.52, SGD: 1.35, AED: 3.67,
};

export const CURRENCIES = Object.keys(RATES);

// Shipping countries and the currency each one bills in.
export const COUNTRIES = [
  { name: 'United States', currency: 'USD' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'India', currency: 'INR' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'France', currency: 'EUR' },
  { name: 'Spain', currency: 'EUR' },
  { name: 'Italy', currency: 'EUR' },
  { name: 'Netherlands', currency: 'EUR' },
  { name: 'Ireland', currency: 'EUR' },
  { name: 'Japan', currency: 'JPY' },
  { name: 'Canada', currency: 'CAD' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Singapore', currency: 'SGD' },
  { name: 'United Arab Emirates', currency: 'AED' },
];

// Region (from the browser locale) -> currency.
const REGION_TO_CCY = {
  US: 'USD', GB: 'GBP', IN: 'INR', JP: 'JPY', CA: 'CAD', AU: 'AUD',
  SG: 'SGD', AE: 'AED',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR',
};

// Auto-detect the shopper's currency from their browser locale/region.
export const detectCurrency = () => {
  try {
    const loc = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
    let region;
    if (typeof Intl !== 'undefined' && Intl.Locale) {
      try { region = new Intl.Locale(loc).region; } catch { /* fall through */ }
    }
    if (!region) region = loc.split('-')[1];
    const ccy = REGION_TO_CCY[(region || '').toUpperCase()];
    return ccy && RATES[ccy] ? ccy : 'USD';
  } catch {
    return 'USD';
  }
};

export const convert = (baseUsd, code) => (Number(baseUsd) || 0) * (RATES[code] || 1);

// Inverse of convert: turn an amount entered in `code` back into the USD base used for storage.
export const toBaseCurrency = (localAmount, code) => (Number(localAmount) || 0) / (RATES[code] || 1);

// Convert a USD base amount to the given currency and format it with the local symbol.
export const formatMoney = (baseUsd, code = 'USD') => {
  const amount = convert(baseUsd, code);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: ['JPY'].includes(code) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
};

const currencySlice = createSlice({
  name: 'currency',
  initialState: { code: detectCurrency() },
  reducers: {
    setCurrency: (state, action) => {
      if (RATES[action.payload]) state.code = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export const selectCurrency = (state) => state.currency.code;
export default currencySlice.reducer;
