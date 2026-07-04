import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';
import LayersIcon from '@mui/icons-material/Layers';

// Actions & Contexts
import { toggleSidebar } from '../redux/slices/uiSlice';
import { logoutSuccess } from '../redux/slices/authSlice';
import { useAppTheme } from '../contexts/ThemeContext';
import { ProfileMenu } from '../components/CommonComponents';
import authService from '../services/authService';

const drawerWidth = 260;

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  
  const { mode, toggleTheme } = useAppTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      dispatch(toggleSidebar());
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout request failed: ', e);
    } finally {
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Notifications Logs', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
  ];

  const secondaryMenuItems = [
    { text: 'App Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
  ];

  // Helper to generate breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);

  const renderDrawerContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [2] }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LayersIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
            Vendra
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      
      {/* User Quick Info Summary */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'secondary.main', fontWeight: 800 }}>
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, noWrap: true }}>
            {user?.username || 'Vendra User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', noWrap: true }}>
            {user?.roles?.[0] || 'ROLE_CUSTOMER'}
          </Typography>
        </Box>
      </Box>
      <Divider />

      <List sx={{ px: 1.5, py: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: '10px',
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      <List sx={{ px: 1.5, mt: 'auto', mb: 2 }}>
        {secondaryMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: '10px',
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Navigation Header bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              Management Console
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {/* Theme Toggle Icon */}
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            
            {/* Notification Bell Icon */}
            <IconButton color="inherit" onClick={() => navigate('/dashboard/notifications')}>
              <NotificationsIcon />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />
            
            {/* Account Settings Profile drop list */}
            <ProfileMenu
              user={user}
              onLogout={handleLogout}
              onNavigateProfile={() => navigate('/dashboard/profile')}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer Component */}
      {/* Mobile Drawer (Responsive Drawer) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {renderDrawerContent()}
      </Drawer>
      
      {/* Desktop Drawer (Persistent Drawer with expand/collapse) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open={sidebarOpen}
      >
        {renderDrawerContent()}
      </Drawer>

      {/* Primary Main Content container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          mt: '64px', // Offset for app bar
        }}
      >
        <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: { xs: 0, sm: 2 } }}>
          
          {/* Reusable Breadcrumbs */}
          <Breadcrumbs
            separator="/"
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
          >
            <Link
              underline="hover"
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 'inherit' }} />
              Home
            </Link>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
              
              if (formattedName === 'Dashboard') return null; // Skip redundant root breadcrumb

              return isLast ? (
                <Typography color="text.primary" key={name} sx={{ fontWeight: 600 }}>
                  {formattedName}
                </Typography>
              ) : (
                <Link
                  underline="hover"
                  color="inherit"
                  component={RouterLink}
                  to={routeTo}
                  key={name}
                >
                  {formattedName}
                </Link>
              );
            })}
          </Breadcrumbs>

          {/* Child routes render page content */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <Outlet />
          </Box>

          {/* Reusable Page Footer */}
          <Box component="footer" sx={{ py: 3, mt: 'auto', borderTop: (theme) => `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {'© '}
              {new Date().getFullYear()}
              {' Vendra Inc. Production-Ready Boilerplate. All rights reserved.'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
