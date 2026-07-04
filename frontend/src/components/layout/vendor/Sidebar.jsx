import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton } from '@mui/material';
import { LayoutDashboard, Package, Boxes, ShoppingBag, BarChart3, Star, Wallet, ShieldCheck, User, X } from 'lucide-react';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, onMobileClose, isMobile }) => {
  const menuItems = [
    { text: 'Dashboard', path: '/vendor', icon: LayoutDashboard },
    { text: 'Products', path: '/vendor/products', icon: Package },
    { text: 'Inventory', path: '/vendor/inventory', icon: Boxes },
    { text: 'Orders', path: '/vendor/orders', icon: ShoppingBag },
    { text: 'Analytics', path: '/vendor/analytics', icon: BarChart3 },
    { text: 'Reviews', path: '/vendor/reviews', icon: Star },
    { text: 'Earnings', path: '/vendor/earnings', icon: Wallet },
    { text: 'Trust Score', path: '/vendor/trust-score', icon: ShieldCheck },
    { text: 'Profile', path: '/vendor/profile', icon: User },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#111827' : 'primary.main', color: '#FFFFFF' }}>
      {/* Brand logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box>
          <Typography variant="h5" fontWeight={900} color="secondary.main" sx={{ letterSpacing: '-0.04em' }}>
            Vendra
          </Typography>
          <Typography variant="caption" sx={{ color: 'grey.400', fontWeight: 650, letterSpacing: '0.05em' }}>
            ARTISAN CONSOLE
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onMobileClose} sx={{ color: '#FFFFFF' }}>
            <X size={20} />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Navigation list */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }} className="sidebar-list">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/vendor'}
              onClick={isMobile ? onMobileClose : undefined}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1.2,
                color: 'grey.300',
                '&.active': {
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                },
                '&:hover:not(.active)': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <item.icon size={20} />
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid #E5E7EB', boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
