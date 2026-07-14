import React, { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Stepper, Step, StepLabel, StepContent, Skeleton, Stack } from '@mui/material';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrderById, clearSelectedOrder } from '../../features/customer/orders/orderSlice';
import Spinner from '../../components/common/Spinner';

// Placeholder Map Component for future websocket/geolocation API integration
const OrderTrackingMap = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 320,
        backgroundColor: 'action.hover',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px dashed',
        borderColor: 'secondary.main',
        p: 3,
        textAlign: 'center'
      }}
    >
      <MapPin size={40} color="#A0814D" style={{ marginBottom: '12px' }} />
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        Live Shipment Geolocation Map
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320, mt: 1, lineHeight: 1.5 }}>
        {/* FUTURE INTEGRATION POINT */}
        <strong>Future Integration Point:</strong> Connect Leaflet.js or Google Maps SDK here. This component will connect to a WebSockets server to poll live coordinates from the Spring Boot Shipment Microservice.
      </Typography>
    </Box>
  );
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedOrder: order, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, id]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom fontWeight={700}>
          Order Details Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {error}
        </Typography>
        <Button component={RouterLink} to="/customer/orders" variant="contained">
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (loading || !order) {
    return <Spinner message="Fetching order tracking metrics..." height="400px" />;
  }

  const steps = [
    { label: 'Order Placed', description: 'Your order has been recorded in the platform.' },
    { label: 'Order Confirmed', description: 'The vendor has approved and started packaging your order.' },
    { label: 'Shipped', description: 'The parcel was picked up by our shipping carrier.' },
    { label: 'Out for Delivery', description: 'The local courier is delivering your handcrafted package today.' },
    { label: 'Delivered', description: 'The package was successfully signed for and received.' }
  ];

  const getActiveStep = (status) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const activeStep = getActiveStep(order.status);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Button
        component={RouterLink}
        to="/customer/orders"
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Back to Orders
      </Button>

      <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
        Track Order
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
        Order Reference: <strong style={{ fontFamily: 'monospace' }}>#{order.id}</strong>
      </Typography>

      <Grid container spacing={5}>
        {/* Left Side: Timeline Stepper */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Truck size={20} /> Delivery Milestones
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>
                      <Typography variant="body2" fontWeight={700} color={activeStep >= index ? 'primary.main' : 'text.disabled'}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Map & Items Info */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Live Map Placeholder */}
            <OrderTrackingMap />

            {/* Shipment address summary */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="secondary.dark" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delivery Address
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {order.shippingAddress || 'No delivery address on file.'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderTrackingPage;
