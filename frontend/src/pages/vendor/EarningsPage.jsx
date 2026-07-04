import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton } from '@mui/material';
import { Wallet, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCommissionLedger } from '../../features/vendor/commission/commissionSlice';
import axiosInstance from '../../api/axiosInstance';
import EmptyState from '../../components/common/EmptyState';

const EarningsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { ledger, loading } = useAppSelector((state) => state.vendorCommission);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get(`/vendorProfiles?userId=${user.id}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          const v = res.data[0];
          setVendor(v);
          dispatch(fetchCommissionLedger(v.id));
        }
      });
  }, [dispatch, user]);

  // Calculations for financial stats cards
  const grossSales = ledger.reduce((sum, item) => sum + item.grossSales, 0);
  const commissionDeducted = ledger.reduce((sum, item) => sum + item.commissionDeducted, 0);
  const netPayout = ledger.reduce((sum, item) => sum + item.netPayout, 0);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="200px" height="40px" sx={{ mb: 2 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Earnings Ledger & Commission
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track gross sales receipts, platform commission deductions, and net warehouse payouts.
        </Typography>
      </Box>

      {/* Trust & Transparency Banner */}
      <Box
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: 3,
          backgroundColor: 'rgba(15, 118, 110, 0.04)',
          border: '1px solid rgba(15, 118, 110, 0.15)',
          color: '#0F766E',
          display: 'flex',
          gap: 2,
        }}
      >
        <Sparkles size={22} style={{ marginTop: 2, flexShrink: 0 }} />
        <Box>
          <Typography variant="body2" fontWeight={750} sx={{ mb: 0.5 }}>
            Vendra's Zero-Opacity Pledge
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
            Unlike other marketplaces, Vendra does not hide extra transaction markups. We charge a flat **15%** commission on completed sales, which is fully reinvested into artisanal advertising, carbon-neutral shipping networks, and platform upkeep. Review every invoice breakdown transparently below.
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Gross Revenue', value: `$${grossSales.toFixed(2)}`, color: 'text.primary' },
          { title: 'Commission Deducted (15%)', value: `-$${commissionDeducted.toFixed(2)}`, color: 'error.main' },
          { title: 'Net Partner Payout', value: `$${netPayout.toFixed(2)}`, color: 'success.main' }
        ].map((card, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight={850} color={card.color}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ledger Table */}
      {ledger.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No earnings history"
          description="Your payouts logs will update here automatically as orders are confirmed and delivered."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell><Typography variant="body2" fontWeight={750}>Order ID</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Settlement Date</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Gross Sales</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Rate</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Deductions</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Net Payout</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledger.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{item.orderId.slice(0, 14)}...</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${item.grossSales.toFixed(2)}</TableCell>
                  <TableCell>{(item.commissionRate * 100).toFixed(0)}%</TableCell>
                  <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>
                    -${item.commissionDeducted.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${item.netPayout.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EarningsPage;
