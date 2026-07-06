import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Button, Stack } from '@mui/material';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity } from '../../../features/customer/cart/cartSlice';
import axiosInstance from '../../../api/axiosInstance';
import EmptyState from '../../common/EmptyState';

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);

  const [vendorNames, setVendorNames] = useState({});

  useEffect(() => {
    if (open) {
      axiosInstance.get('/api/v1/vendors')
        .then(res => {
          const map = {};
          res.data.forEach(v => {
            map[v.id] = v.businessName;
          });
          setVendorNames(map);
        })
        .catch(err => console.error('Error fetching vendors:', err));
    }
  }, [open]);

  // Group items by vendorId
  const groupedItems = cartItems.reduce((groups, item) => {
    const vId = item.vendorId || 'unknown';
    if (!groups[vId]) {
      groups[vId] = [];
    }
    groups[vId].push(item);
    return groups;
  }, {});

  const handleCheckoutClick = () => {
    onClose();
    navigate('/customer/checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 400 }, display: 'flex', flexDirection: 'column' }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingBag size={20} />
          <Typography variant="subtitle1" fontWeight={700}>Shopping Cart</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* Cart Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add beautiful objects crafted by local artisans to your cart."
            actionText="Browse Products"
            onActionClick={() => { onClose(); navigate('/customer'); }}
          />
        ) : (
          Object.keys(groupedItems).map((vendorId) => {
            const vendorName = vendorNames[vendorId] || 'Artisanal Seller';
            const items = groupedItems[vendorId];

            return (
              <Box key={vendorId} sx={{ mb: 3 }}>
                {/* Vendor Header */}
                <Typography variant="caption" fontWeight={700} sx={{ color: 'secondary.dark', display: 'block', mb: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Ships from: {vendorName}
                </Typography>

                <Stack spacing={2}>
                  {items.map((item) => (
                    <Box 
                      key={item.productId}
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        p: 1.5, 
                        borderRadius: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'action.hover'
                      }}
                    >
                      {/* Product Image */}
                      <Box 
                        component="img"
                        src={item.imageUrl}
                        alt={item.name}
                        sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                      />

                      {/* Product Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
                          ${item.price}
                        </Typography>

                        {/* Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                            sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}
                          >
                            <Minus size={14} />
                          </IconButton>
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                            sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}
                          >
                            <Plus size={14} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Remove Button */}
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => dispatch(removeFromCart(item.productId))}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {cartItems.length > 0 && (
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" fontWeight={600}>Subtotal</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">${cartTotal}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Shipping and taxes calculated at checkout.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleCheckoutClick}
            sx={{ py: 1.5, borderRadius: '8px' }}
          >
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
