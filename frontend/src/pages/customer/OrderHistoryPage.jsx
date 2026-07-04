import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Stack, Skeleton } from '@mui/material';
import { Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrders } from '../../features/customer/orders/orderSlice';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import axiosInstance from '../../api/axiosInstance';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading } = useAppSelector((state) => state.orders);

  const [vendorNames, setVendorNames] = useState({});

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.id));
      axiosInstance.get('/vendorProfiles')
        .then(res => {
          const map = {};
          res.data.forEach(v => {
            map[v.id] = v.businessName;
          });
          setVendorNames(map);
        })
        .catch(err => console.error('Error fetching vendors in order history:', err));
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>Order History</Typography>
        <Stack spacing={3}>
          {Array.from(new Array(3)).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders on Vendra. Start exploring handmade items!"
          actionText="Browse Shop"
          onActionClick={() => navigate('/customer')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Package size={28} />
        <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          My Orders
        </Typography>
      </Box>

      <Stack spacing={3}>
        {orders.map((order) => {
          const vendorName = vendorNames[order.vendorId] || 'Artisanal Seller';

          return (
            <Card key={order.id} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header details */}
                <Box sx={{ p: 2.5, bgcolor: '#FBFBFA', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase' }}>
                        Date Placed
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase' }}>
                        Total
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        ${order.total}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase' }}>
                        Ships From
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {vendorName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block' }}>
                      Order Ref
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                      #{order.id.slice(0, 14)}...
                    </Typography>
                  </Box>
                </Box>

                {/* Items and Action */}
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        {order.items.map((item) => (
                          <Box key={item.productId} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box 
                              component="img"
                              src={item.imageUrl}
                              sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #E5E7EB' }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} &bull; ${item.price} each
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' }, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                      <Badge variant={order.status}>
                        {order.status}
                      </Badge>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/customer/orders/track/${order.id}`)}
                        endIcon={<ArrowRight size={14} />}
                        sx={{ borderRadius: '20px', px: 3 }}
                      >
                        Track Order
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};

export default OrderHistoryPage;
