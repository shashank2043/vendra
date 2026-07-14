import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrency, setCurrency, CURRENCIES } from '../../features/currency/currencySlice';

// Shared currency switcher used across customer, vendor and admin portals.
// The choice is global (persisted), so money reads the same currency everywhere.
const CurrencySelector = () => {
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  return (
    <Select
      size="small"
      value={currency}
      onChange={(e) => dispatch(setCurrency(e.target.value))}
      variant="standard"
      disableUnderline
      sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary', '& .MuiSelect-select': { py: 0.5 } }}
    >
      {CURRENCIES.map((c) => (
        <MenuItem key={c} value={c} sx={{ fontSize: '0.8rem' }}>{c}</MenuItem>
      ))}
    </Select>
  );
};

export default CurrencySelector;
