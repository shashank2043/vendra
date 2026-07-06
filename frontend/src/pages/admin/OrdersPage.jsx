import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Stack, Divider, Skeleton } from '@mui/material';
import { Search, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllOrders } from '../../features/admin/orders/orderSlice';
import axiosInstance from '../../api/axiosInstance';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.adminOrders);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vendors, setVendors] = useState({});

  useEffect(() => {
    dispatch(fetchAllOrders());

    axiosInstance.get('/api/v1/vendors')
      .then(res => {
        const map = {};
        res.data.forEach(v => {
          map[v.id] = v.businessName;
        });
        setVendors(map);
      })
      .catch(err => console.error(err));
  }, [dispatch]);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };

  const getFilteredOrders = () => {
    let list = orders;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.userName.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(o => o.status === statusFilter);
    }

    return list;
  };

  const filteredOrders = getFilteredOrders();

  if (loading && orders.length === 0) {
    return (
      <Box>
        <Skeleton variant="text" width="220px" height="40px" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Platform Order Oversight
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track customer transactions across all artisan shops, inspect payment logs, and check logistics.
        </Typography>
      </Box>

      {/* Filter Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Order Reference ID or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#9CA3AF" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="order-status-filter-label">Filter Shipment Status</InputLabel>
            <Select
              labelId="order-status-filter-label"
              value={statusFilter}
              label="Filter Shipment Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Orders</MenuItem>
              <MenuItem value="PLACED">Placed</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No transactions found"
          description="There are no platform transaction receipts corresponding to these search filters."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell><Typography variant="body2" fontWeight={750}>Order Reference ID</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Customer Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Date Placed</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Shipment Status</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Total Paid</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  hover 
                  onClick={() => handleRowClick(order)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{String(order.id).slice(0, 14)}</TableCell>
                  <TableCell fontWeight={600}>{order.userName}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.status}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>${order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle fontWeight={750} sx={{ pb: 1 }}>
              Order Reference #{selectedOrder.id}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={4}>
                
                {/* Shipping & Payment summary */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ mb: 1, textTransform: 'uppercase' }}>
                    Shipping Coordinates
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedOrder.shippingAddress?.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress?.addressLine1}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress?.country}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ mb: 1, textTransform: 'uppercase' }}>
                    Payment Summary
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Payment Gateway:</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedOrder.paymentMethod || 'Razorpay sandbox'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Platform Charge:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      ${(selectedOrder.total * 0.15).toFixed(2)} (15%)
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Purchased items split by vendor */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ mb: 2, textTransform: 'uppercase' }}>
                    Artisan Warehouse Postings
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#FBFBFA', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                      Shop: {vendors[selectedOrder.vendorId] || 'Artisan Seller'}
                    </Typography>
                    
                    <Stack spacing={2}>
                      {selectedOrder.items.map((item) => (
                        <Box key={item.productId} sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box 
                              component="img" 
                              src={item.imageUrl} 
                              sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #E5E7EB' }} 
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">Qty: {item.quantity} &bull; ${item.price} each</Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight={700}>
                            ${item.price * item.quantity}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="contained" onClick={handleCloseDialog} color="primary" sx={{ fontWeight: 700 }}>
                Close Summary
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </Box>
  );
};

export default OrdersPage;
