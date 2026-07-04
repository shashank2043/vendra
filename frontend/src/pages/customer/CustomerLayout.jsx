import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../../components/layout/customer/Navbar';
import Footer from '../../components/layout/customer/Footer';

const CustomerLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Box 
        component="main" 
        className="fade-in-page"
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomerLayout;
