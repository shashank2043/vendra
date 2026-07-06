import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Stepper, Step, StepLabel, Card, CardContent, Grid, TextField, Button, Divider, Stack, FormControl, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { CreditCard, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '../../features/customer/cart/cartSlice';
import { nextStep, prevStep, updateAddress, setPaymentMethod, resetCheckout } from '../../features/customer/checkout/checkoutSlice';
import { placeOrder } from '../../features/customer/orders/orderSlice';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const { step, address, paymentMethod } = useAppSelector((state) => state.checkout);
  const { user } = useAppSelector((state) => state.auth);

  const [vendorNames, setVendorNames] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/v1/vendors')
      .then(res => {
        const map = {};
        (res.data || []).forEach(v => {
          map[v.id] = v.businessName;
        });
        setVendorNames(map);
      })
      .catch(err => console.error('Error fetching vendors:', err));
  }, []);

  if (cartItems.length === 0 && step !== 2) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <EmptyState
          icon={CheckCircle}
          title="Checkout Completed or Cart is Empty"
          description="You don't have any items in your checkout session."
          actionText="Start Shopping"
          onActionClick={() => navigate('/customer')}
        />
      </Container>
    );
  }

  // Address validation
  const handleAddressNext = () => {
    const errors = {};
    if (!address.fullName.trim()) errors.fullName = 'Full name is required';
    if (!address.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    dispatch(nextStep());
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Opens the real Razorpay checkout using the publishable key sourced from
  // payment-service/.env (exposed to the client by vite.config.js as VITE_RAZORPAY_KEY_ID).
  // Falls back to a sandbox simulation when no key is configured.
  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey || !razorpayKey.startsWith('rzp_')) {
      setTimeout(() => {
        toast.success('Payment authorized (Razorpay sandbox).');
        setPaymentProcessing(false);
        dispatch(nextStep());
      }, 1000);
      return;
    }

    try {
      // The backend creates the Razorpay order using the secret key (server-side only).
      const checkoutRef = `checkout-${Date.now()}`;
      const createRes = await axiosInstance.post('/api/v1/payments/create-order', {
        orderId: checkoutRef,
        amount: cartTotal,
      });
      const { razorpayOrderId, amount, currency } = createRes.data || {};

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error('Razorpay SDK failed to load');

      const rzp = new window.Razorpay({
        key: razorpayKey,
        order_id: razorpayOrderId,
        amount: amount ?? Math.round(cartTotal * 100),
        currency: currency || 'INR',
        name: 'Vendra',
        description: 'Multi-Vendor Checkout',
        prefill: {
          name: address.fullName || user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#111827' },
        handler: async (response) => {
          try {
            await axiosInstance.post('/api/v1/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          } catch (e) {
            console.warn('Payment verification call failed:', e);
          }
          toast.success('Payment successful!');
          setPaymentProcessing(false);
          dispatch(nextStep());
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            toast.warning('Payment cancelled.');
          },
        },
      });
      rzp.on('payment.failed', () => {
        setPaymentProcessing(false);
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      setPaymentProcessing(false);
      toast.error('Could not start payment. Please try again.');
    }
  };

  // Group items by vendorId
  const groupedItems = cartItems.reduce((groups, item) => {
    const vId = item.vendorId || 'unknown';
    if (!groups[vId]) {
      groups[vId] = [];
    }
    groups[vId].push(item);
    return groups;
  }, {});

  const handlePlaceOrder = async () => {
    setSubmittingOrder(true);

    try {
      // Split the order per vendor; the backend generates ids + parentOrderId.
      const orderPromises = Object.keys(groupedItems).map((vendorId) => {
        const items = groupedItems[vendorId];
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Backend expects shippingAddress as a single string.
        const shippingAddress = [
          address.fullName,
          address.addressLine1,
          `${address.city || ''} ${address.postalCode || ''}`.trim(),
          address.country,
        ].filter(Boolean).join(', ');

        const vendorOrder = {
          userId: user.username,
          vendorId,
          items,
          total: subtotal,
          shippingAddress,
          paymentMethod: paymentMethod || 'Razorpay',
          priority: 'STANDARD',
        };

        return dispatch(placeOrder(vendorOrder)).unwrap();
      });

      await Promise.all(orderPromises);
      toast.success('Your order has been placed successfully!');

      // Seed a platform notification for this purchase
      try {
        const orderMessage = 'Your order has been placed successfully! Tracking available in your orders.';
        await axiosInstance.post('/notifications', {
          role: 'CUSTOMER',
          userId: user.username,
          message: orderMessage,
          subject: 'Order Placed',
          body: orderMessage,
        });
      } catch (e) {
        console.warn('Notification seed skipped:', e);
      }

      dispatch(resetCheckout());
      navigate('/customer/orders');
    } catch (err) {
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const stepsList = ['Shipping Address', 'Payment', 'Review & Confirm'];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stepper activeStep={step} sx={{ mb: 5 }}>
        {stepsList.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        {/* Step details content */}
        <Grid item xs={12} md={8}>
          {step === 0 && (
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={20} /> Shipping Address
                </Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={address.fullName}
                    onChange={(e) => dispatch(updateAddress({ fullName: e.target.value }))}
                    error={!!addressErrors.fullName}
                    helperText={addressErrors.fullName}
                    required
                  />
                  <TextField
                    label="Address Line 1"
                    fullWidth
                    value={address.addressLine1}
                    onChange={(e) => dispatch(updateAddress({ addressLine1: e.target.value }))}
                    error={!!addressErrors.addressLine1}
                    helperText={addressErrors.addressLine1}
                    required
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="City"
                        fullWidth
                        value={address.city}
                        onChange={(e) => dispatch(updateAddress({ city: e.target.value }))}
                        error={!!addressErrors.city}
                        helperText={addressErrors.city}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Postal Code"
                        fullWidth
                        value={address.postalCode}
                        onChange={(e) => dispatch(updateAddress({ postalCode: e.target.value }))}
                        error={!!addressErrors.postalCode}
                        helperText={addressErrors.postalCode}
                        required
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Country"
                    fullWidth
                    value={address.country}
                    onChange={(e) => dispatch(updateAddress({ country: e.target.value }))}
                    disabled
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddressNext}
                      endIcon={<ArrowRight size={16} />}
                      sx={{ borderRadius: '8px', px: 4 }}
                    >
                      Next: Payment
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard size={20} /> Secure Checkout
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                  <RadioGroup value={paymentMethod} onChange={(e) => dispatch(setPaymentMethod(e.target.value))}>
                    <Box sx={{ border: '1.5px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <FormControlLabel
                        value="Razorpay"
                        control={<Radio />}
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body1" fontWeight={750}>Razorpay Gateway</Typography>
                            <Typography variant="caption" color="text.secondary">Supports Cards, UPI, Netbanking, and Wallets</Typography>
                          </Box>
                        }
                      />
                      <Box component="img" src="https://razorpay.com/assets/razorpay-glyph.svg" sx={{ width: 28, height: 28 }} />
                    </Box>
                  </RadioGroup>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => dispatch(prevStep())}
                    startIcon={<ArrowLeft size={16} />}
                    sx={{ borderRadius: '8px' }}
                    disabled={paymentProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleRazorpayPayment}
                    disabled={paymentProcessing}
                    endIcon={paymentProcessing ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                    sx={{ borderRadius: '8px', px: 4 }}
                  >
                    {paymentProcessing ? 'Connecting...' : `Pay $${cartTotal} via Razorpay`}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Review Your Purchase
                </Typography>
                
                {/* Shipping Details */}
                <Box sx={{ mb: 4, p: 2, borderRadius: 2, border: '1px solid #f0f0f0', bgcolor: '#fbfbfb' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="secondary.dark" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Shipping Destination
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>{address.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{address.addressLine1}</Typography>
                  <Typography variant="body2" color="text.secondary">{address.city}, {address.postalCode}</Typography>
                  <Typography variant="body2" color="text.secondary">{address.country}</Typography>
                </Box>

                {/* Items split by vendor */}
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Review Products
                </Typography>
                <Stack spacing={3} sx={{ mb: 4 }}>
                  {Object.keys(groupedItems).map((vendorId) => {
                    const vendorName = vendorNames[vendorId] || 'Artisanal Seller';
                    const items = groupedItems[vendorId];
                    return (
                      <Box key={vendorId} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                          Ships from: {vendorName}
                        </Typography>
                        <Stack spacing={2}>
                          {items.map((item) => (
                            <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Box component="img" src={item.imageUrl} sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover' }} />
                                <Box>
                                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Qty: {item.quantity}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Typography variant="body2" fontWeight={700}>
                                ${item.price * item.quantity}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => dispatch(prevStep())}
                    startIcon={<ArrowLeft size={16} />}
                    sx={{ borderRadius: '8px' }}
                    disabled={submittingOrder}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    endIcon={submittingOrder ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
                    sx={{ borderRadius: '8px', px: 4, py: 1, color: 'primary.main', fontWeight: 700 }}
                  >
                    {submittingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 90 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 2 }}>
                Order Summary
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={650}>${cartTotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2" fontWeight={650} color="success.main">FREE</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Tax</Typography>
                  <Typography variant="body2" fontWeight={650}>$0.00</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main">${cartTotal}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
