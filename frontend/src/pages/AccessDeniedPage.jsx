import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { role } = useAppSelector((state) => state.auth);

  const handleGoHome = () => {
    if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (role === 'VENDOR') {
      navigate('/vendor', { replace: true });
    } else {
      navigate('/customer', { replace: true });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(190, 18, 60, 0.08)',
            p: 3,
            borderRadius: '50%',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={48} color="#BE123C" />
        </Box>
        
        <Typography variant="h3" fontWeight={800} color="primary" sx={{ mb: 2, letterSpacing: '-0.02em' }}>
          Access Denied
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, px: 2 }}>
          You do not have permissions to access this section of Vendra. Mismatched portal requests are automatically blocked for security.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleGoHome}
          sx={{ px: 4, py: 1.2, borderRadius: '8px' }}
        >
          Return to Portal Root
        </Button>
      </Box>
    </Container>
  );
};

export default AccessDeniedPage;
