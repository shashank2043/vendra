import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout, toggleThemeMode } from '../../../features/auth/authSlice';
import NotificationBell from '../../../features/notifications/components/NotificationBell';
import NotificationDropdown from '../../../features/notifications/components/NotificationDropdown';

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.auth.themeMode) || 'light';

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const getPageTitle = (path) => {
    if (path === '/vendor') return 'Dashboard Overview';
    if (path.startsWith('/vendor/products')) return 'Product Catalog';
    if (path.startsWith('/vendor/inventory')) return 'Inventory Manager';
    if (path.startsWith('/vendor/orders')) return 'Manage Orders';
    if (path.startsWith('/vendor/analytics')) return 'Sales Analytics';
    if (path.startsWith('/vendor/reviews')) return 'Received Reviews';
    if (path.startsWith('/vendor/earnings')) return 'Earnings Ledger';
    if (path.startsWith('/vendor/trust-score')) return 'Trust Score Metrics';
    if (path.startsWith('/vendor/profile')) return 'Shop Settings';
    return 'Console';
  };

  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    handleProfileClose();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#FFFFFF', color: '#111827', borderBottom: '1px solid #E5E7EB', zIndex: 1000 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          
          {/* Mobile hamburger menu and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon size={22} />
            </IconButton>
            <Typography variant="h6" fontWeight={750} sx={{ letterSpacing: '-0.015em' }}>
              {getPageTitle(location.pathname)}
            </Typography>
          </Box>

          {/* Right menu icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Switcher */}
            <IconButton color="inherit" onClick={() => dispatch(toggleThemeMode())} sx={{ mr: 0.5 }}>
              {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>

            {/* Shared Notification Bell */}
            <NotificationBell onClick={handleNotifOpen} />

            {/* Profile Avatar */}
            <IconButton onClick={handleProfileOpen} sx={{ p: 0.5, ml: 0.5 }}>
              <Avatar 
                src={user?.picture || ''} 
                alt={user?.name || 'Vendor'}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  border: '1.5px solid', 
                  borderColor: 'secondary.main',
                  backgroundColor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {user?.name ? user.name.charAt(0) : 'V'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Shared Dropdown */}
      <NotificationDropdown 
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
      />

      {/* Profile Actions Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
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
            {user?.name || 'Vendor'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <MenuItem onClick={() => { handleProfileClose(); navigate('/vendor/profile'); }} sx={{ fontSize: '0.875rem', gap: 1 }}>
          <User size={16} /> Shop Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', color: 'error.main', gap: 1 }}>
          <LogOut size={16} /> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Topbar;
