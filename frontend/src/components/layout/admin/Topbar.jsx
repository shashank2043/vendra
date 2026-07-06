import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import NotificationBell from '../../../features/notifications/components/NotificationBell';
import NotificationDropdown from '../../../features/notifications/components/NotificationDropdown';

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const getPageTitle = (path) => {
    if (path === '/admin') return 'Overview Dashboard';
    if (path.startsWith('/admin/vendor-approvals')) return 'Vendor Applications';
    if (path.startsWith('/admin/product-moderation')) return 'Product Moderation Queue';
    if (path.startsWith('/admin/orders')) return 'Platform Order Oversight';
    if (path.startsWith('/admin/commission-rules')) return 'Commission Rate Structures';
    if (path.startsWith('/admin/disputes')) return 'Customer Disputes & Resolutions';
    if (path.startsWith('/admin/reports')) return 'Financial Reports & SLA';
    if (path.startsWith('/admin/users')) return 'Platform User Accounts';
    return 'Admin Console';
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
          
          {/* Hamburger menu and Page Title */}
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
            {/* Notifications */}
            <NotificationBell onClick={handleNotifOpen} />

            {/* Admin Avatar */}
            <IconButton onClick={handleProfileOpen} sx={{ p: 0.5, ml: 0.5 }}>
              <Avatar 
                src={user?.picture || ''} 
                alt={user?.name || 'Admin'}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  border: '1.5px solid', 
                  borderColor: '#38BDF8',
                  backgroundColor: '#0F172A',
                  fontSize: '0.875rem'
                }}
              >
                {user?.name ? user.name.charAt(0) : 'A'}
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

      {/* Admin Actions Dropdown Menu */}
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
            {user?.name || 'Platform Admin'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', color: 'error.main', gap: 1 }}>
          <LogOut size={16} /> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Topbar;
