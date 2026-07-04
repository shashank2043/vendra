import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const Footer = () => {
  return (
    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B0F19' : 'primary.main', color: '#FFFFFF', pt: 6, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={800} color="secondary.main" sx={{ mb: 2, letterSpacing: '-0.03em' }}>
              Vendra
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2, maxWidth: 280, lineHeight: 1.6 }}>
              A curated marketplace bringing together independent, artisanal sellers and quality-conscious customers.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#FFFFFF' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#FFFFFF' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#FFFFFF' } }}>
                <FacebookIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links Column */}
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shop Collections
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/customer/search?category=cat-1" color="grey.400" underline="none" sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}>
                Home & Living
              </Link>
              <Link component={RouterLink} to="/customer/search?category=cat-2" color="grey.400" underline="none" sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}>
                Apparel & Accessories
              </Link>
              <Link component={RouterLink} to="/customer/search?category=cat-3" color="grey.400" underline="none" sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}>
                Stationery & Craft
              </Link>
            </Box>
          </Grid>

          {/* Support Column */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Help & Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="#" 
                onClick={(e) => { e.preventDefault(); toast.info("FAQ answers coming soon!"); }} 
                color="grey.400" 
                underline="none" 
                sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}
              >
                FAQs
              </Link>
              <Link 
                href="#" 
                onClick={(e) => { e.preventDefault(); toast.info("Shipping Policy coming soon!"); }} 
                color="grey.400" 
                underline="none" 
                sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}
              >
                Shipping Policy
              </Link>
              <Link 
                href="#" 
                onClick={(e) => { e.preventDefault(); toast.info("Returns Center details coming soon!"); }} 
                color="grey.400" 
                underline="none" 
                sx={{ '&:hover': { color: '#FFFFFF' }, fontSize: '0.875rem' }}
              >
                Returns
              </Link>
            </Box>
          </Grid>

          {/* Become Vendor Column */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              For Artisans
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2, fontSize: '0.875rem', lineHeight: 1.5 }}>
              Have unique products to offer? Become a partner seller on Vendra.
            </Typography>
            <Link 
              component={RouterLink} 
              to="/vendor" 
              color="secondary.main" 
              underline="hover" 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 700, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}
            >
              Become a Vendor <ArrowUpRight size={16} />
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            &copy; {new Date().getFullYear()} Vendra. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            Designed for premium retail.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
