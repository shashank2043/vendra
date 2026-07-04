import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tabs, Tab, Collapse, Button, Grid, Stack, Skeleton } from '@mui/material';
import { ChevronDown, ChevronUp, CheckCircle, Truck, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchVendorOrders, updateOrderStatus } from '../../features/vendor/orders/orderSlice';
import axiosInstance from '../../api/axiosInstance';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const OrderRow = ({ order, onStatusUpdate }) => {
  const [open, setOpen] = useState(false);

  const getActionDetails = () => {
    switch (order.status) {
      case 'PLACED':
        return { label: 'Confirm Order', nextStatus: 'CONFIRMED', icon: CheckCircle };
      case 'CONFIRMED':
        return { label: 'Mark Shipped', nextStatus: 'SHIPPED', icon: Truck };
      case 'SHIPPED':
        return { label: 'Mark Delivered', nextStatus: 'DELIVERED', icon: CheckCircle };
      default:
        return null;
    }
  };

  const action = getActionDetails();

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 14)}...</TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{order.userName}</TableCell>
        <TableCell>
          <Badge variant={order.status}>
            {order.status}
          </Badge>
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700 }}>${order.total}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3, px: 2, borderBottom: '1px solid #E5E7EB' }}>
              <Grid container spacing={4}>
                {/* Shipping Details */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>{order.shippingAddress?.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.shippingAddress?.addressLine1}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.shippingAddress?.country}</Typography>
                </Grid>

                {/* Line Items */}
                <Grid item xs={12} sm={5}>
                  <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Products Purchased
                  </Typography>
                  <Stack spacing={2}>
                    {order.items.map((item) => (
                      <Box key={item.productId} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box component="img" src={item.imageUrl} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {item.quantity} &bull; ${item.price} each</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                {/* Operations Actions */}
                <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                  {action && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onStatusUpdate(order.id, action.nextStatus)}
                      startIcon={<action.icon size={16} />}
                      sx={{ borderRadius: '20px', px: 3, py: 1 }}
                    >
                      {action.label}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading } = useAppSelector((state) => state.vendorOrders);

  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!user) return;
    const vendorId = user.id;
    axiosInstance.get(`/api/v1/vendors/${vendorId}`)
      .then(res => setVendor(res.data))
      .catch(() => {});
    dispatch(fetchVendorOrders(vendorId));
  }, [dispatch, user]);

  const handleStatusUpdate = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }))
      .unwrap()
      .then(() => {
        toast.success(`Order marked as ${status.toLowerCase()}!`);
      })
      .catch((err) => toast.error(err || 'Failed to update order status'));
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 1: // Pending
        return orders.filter(o => o.status === 'PLACED');
      case 2: // Confirmed
        return orders.filter(o => o.status === 'CONFIRMED');
      case 3: // Shipped
        return orders.filter(o => o.status === 'SHIPPED');
      case 4: // Delivered
        return orders.filter(o => o.status === 'DELIVERED');
      default: // All
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width="180px" height="40px" />
        </Box>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Incoming Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track customer purchases, print shipment coordinates, and dispatch packages.
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label={`All (${orders.length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Pending (${orders.filter(o => o.status === 'PLACED').length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Confirmed (${orders.filter(o => o.status === 'CONFIRMED').length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Shipped (${orders.filter(o => o.status === 'SHIPPED').length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Delivered (${orders.filter(o => o.status === 'DELIVERED').length})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="There are no incoming orders corresponding to this status category."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell width={50}></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Order Reference</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Date</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Customer</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Status</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Total</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <OrderRow 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate} 
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrdersPage;
