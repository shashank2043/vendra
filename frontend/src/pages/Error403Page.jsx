import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import ShieldIcon from '@mui/icons-material/Shield';

const Error403Page = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <ShieldIcon sx={{ fontSize: 100, color: 'error.main', mb: 3 }} />
        <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, fontSize: '6rem', lineHeight: 1 }}>
          403
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have the required role authorizations to view this page. Please contact your system administrator.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    </Box>
  );
};

export default Error403Page;
