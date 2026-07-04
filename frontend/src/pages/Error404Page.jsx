import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const Error404Page = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <SentimentVeryDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />
        <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, fontSize: '6rem', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The link you followed may be broken, or the page may have been removed. Let's get you back on track.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </Container>
    </Box>
  );
};

export default Error404Page;
