import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import LayersIcon from '@mui/icons-material/Layers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '12px', p: 1.5, mb: 1.5 }}>
            <LayersIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
            We'll send you an email link to restore access
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    type="submit"
                    sx={{ py: 1.25 }}
                  >
                    Send Recovery Link
                  </Button>
                </Stack>
              </form>
            ) : (
              <Stack spacing={2} textAlign="center">
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                  Recovery Link Sent!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If an account exists for <strong>{email}</strong>, you will receive instructions shortly.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/reset-password')}
                  sx={{ py: 1 }}
                >
                  Mock Reset Password Page
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        <Box textAlign="center" mt={3}>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            color="inherit"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
          >
            <ArrowBackIcon fontSize="small" /> Back to Sign In
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
