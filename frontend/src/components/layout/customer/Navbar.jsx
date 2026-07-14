import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, TextField, IconButton, Badge, Menu, MenuItem, Avatar, InputAdornment, Select } from '@mui/material';
import { Search, Heart, ShoppingCart, LogOut, Package } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { selectCartCount } from '../../../features/customer/cart/cartSlice';
import { selectCurrency, setCurrency, CURRENCIES } from '../../../features/currency/currencySlice';
import ThemeToggle from '../../common/ThemeToggle';
import NotificationBell from '../../../features/notifications/components/NotificationBell';
import NotificationDropdown from '../../../features/notifications/components/NotificationDropdown';
import CartDrawer from './CartDrawer'; // We will create this drawer in components/layout/customer/ or components/CartDrawer.jsx

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector((state) => state.wishlist.productIds.length);
  const currency = useAppSelector(selectCurrency);

  const [searchQuery, setSearchQuery] = useState('');
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const handleProfileMenuOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const handleOrdersClick = () => {
    handleProfileMenuClose();
    navigate('/customer/orders');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', zIndex: 1100 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: { xs: 2, md: 4 } }}>
          
          {/* Logo */}
          <Box 
            component={Link} 
            to="/customer" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'text.primary',
              gap: 1
            }}
          >
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.04em' }}>
              Vendra
            </Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
              CUSTOMER
            </Typography>
          </Box>

          {/* Search bar */}
          <Box 
            component="form" 
            onSubmit={handleSearchSubmit} 
            sx={{ 
              flexGrow: 1, 
              maxWidth: 500, 
              display: 'flex', 
              mx: { xs: 1, sm: 3 } 
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search unique products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#6B7280" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
                  color: 'text.primary',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid', borderColor: 'divider' },
                }
              }}
            />
          </Box>

          {/* Right action icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
            {/* Currency selector (auto-detected from locale, overridable) */}
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

            {/* Wishlist */}
            <IconButton 
              color="inherit" 
              component={Link} 
              to="/customer/wishlist"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <Badge badgeContent={wishlistCount} color="secondary">
                <Heart size={22} />
              </Badge>
            </IconButton>

            {/* Shopping Cart */}
            <IconButton 
              color="inherit" 
              onClick={() => setCartOpen(true)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart size={22} />
              </Badge>
            </IconButton>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell onClick={handleNotifOpen} />

            {/* User Profile */}
            <IconButton 
              onClick={handleProfileMenuOpen} 
              sx={{ p: 0.5, ml: 0.5 }}
            >
              <Avatar 
                src={user?.picture || ''} 
                alt={user?.name || 'User'} 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  border: '1.5px solid', 
                  borderColor: 'secondary.main',
                  backgroundColor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Dropdown */}
      <NotificationDropdown 
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
      />

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 180,
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" fontWeight={700}>
            {user?.name || 'Guest User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <MenuItem onClick={handleOrdersClick} sx={{ fontSize: '0.875rem', gap: 1 }}>
          <Package size={16} /> My Orders
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', color: 'error.main', gap: 1 }}>
          <LogOut size={16} /> Logout
        </MenuItem>
      </Menu>

      {/* Slide-out Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
