import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, Box, TextField, IconButton, Collapse, Chip, Stack, CircularProgress,
} from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { formatMoney, selectCurrency } from '../../features/currency/currencySlice';

// Detailed platform-earnings breakdown sourced from the real commission ledger (same data the
// vendor Earnings page uses), so the rate/amounts match everywhere. Per-vendor + per-order,
// filterable by date. Opened from the "Platform Earnings" card.
const EarningsDialog = ({ open, onClose }) => {
  const currency = useAppSelector(selectCurrency);
  const [ledger, setLedger] = useState([]);
  const [vendorNames, setVendorNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/v1/commission/ledger'),
      axiosInstance.get('/api/v1/vendors'),
    ])
      .then(([ledgerRes, vendorsRes]) => {
        setLedger(ledgerRes.data || []);
        const map = {};
        (vendorsRes.data || []).forEach((v) => { map[v.id || v.userId] = v.businessName || v.username || v.id; });
        setVendorNames(map);
      })
      .catch((e) => console.error('Failed to load earnings data:', e))
      .finally(() => setLoading(false));
  }, [open]);

  const groups = useMemo(() => {
    const fromT = from ? new Date(from).getTime() : -Infinity;
    const toT = to ? new Date(to).getTime() + 86400000 : Infinity;
    const byVendor = {};
    ledger
      .filter((l) => { const t = new Date(l.createdAt).getTime(); return t >= fromT && t < toT; })
      .forEach((l) => {
        const vid = l.vendorId || 'unknown';
        if (!byVendor[vid]) byVendor[vid] = { vendorId: vid, name: vendorNames[vid] || vid, orders: [], gross: 0, commission: 0 };
        const gross = Number(l.grossSales) || 0;
        const commission = Number(l.commissionDeducted) || 0;
        byVendor[vid].orders.push({ id: l.orderId, createdAt: l.createdAt, gross, commission, rate: l.commissionRate });
        byVendor[vid].gross += gross;
        byVendor[vid].commission += commission;
      });
    return Object.values(byVendor).sort((a, b) => b.commission - a.commission);
  }, [ledger, vendorNames, from, to]);

  const totalCommission = groups.reduce((s, g) => s + g.commission, 0);
  const totalOrders = groups.reduce((s, g) => s + g.orders.length, 0);
  // Effective platform rate from actual recorded commissions (e.g. 10%).
  const totalGross = groups.reduce((s, g) => s + g.gross, 0);
  const effRate = totalGross > 0 ? Math.round((totalCommission / totalGross) * 100) : null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle fontWeight={750}>Platform Earnings — Vendor Breakdown</DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <TextField type="date" size="small" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField type="date" size="small" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
          {(from || to) && <Button size="small" onClick={() => { setFrom(''); setTo(''); }}>Clear</Button>}
          <Box sx={{ flexGrow: 1 }} />
          <Chip label={`${totalOrders} orders`} size="small" />
          {effRate != null && <Chip label={`~${effRate}% rate`} size="small" variant="outlined" />}
          <Chip color="success" label={`Platform earnings: ${formatMoney(totalCommission, currency)}`} />
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : groups.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No commission recorded in this range. Commission is booked when an order is confirmed.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40} />
                <TableCell><b>Vendor</b></TableCell>
                <TableCell align="right"><b>Orders</b></TableCell>
                <TableCell align="right"><b>Gross Sales</b></TableCell>
                <TableCell align="right"><b>Platform Commission</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((g) => (
                <React.Fragment key={g.vendorId}>
                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === g.vendorId ? null : g.vendorId)}>
                    <TableCell><IconButton size="small">{expanded === g.vendorId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</IconButton></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700}>{g.name}</Typography></TableCell>
                    <TableCell align="right">{g.orders.length}</TableCell>
                    <TableCell align="right">{formatMoney(g.gross, currency)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMoney(g.commission, currency)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
                      <Collapse in={expanded === g.vendorId} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 1, p: 1.5, bgcolor: '#FBFBFA', borderRadius: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><b>Order</b></TableCell>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell align="right"><b>Order Value</b></TableCell>
                                <TableCell align="right"><b>Rate</b></TableCell>
                                <TableCell align="right"><b>Contribution</b></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {g.orders.map((o, i) => (
                                <TableRow key={o.id + '-' + i}>
                                  <TableCell sx={{ fontFamily: 'monospace' }}>#{String(o.id).slice(0, 12)}</TableCell>
                                  <TableCell>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</TableCell>
                                  <TableCell align="right">{formatMoney(o.gross, currency)}</TableCell>
                                  <TableCell align="right">{o.rate != null ? Math.round(o.rate * 100) + '%' : '—'}</TableCell>
                                  <TableCell align="right" sx={{ color: 'success.main' }}>{formatMoney(o.commission, currency)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EarningsDialog;
