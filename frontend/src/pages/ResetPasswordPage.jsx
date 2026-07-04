import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import LayersIcon from '@mui/icons-material/Layers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PasswordField } from '../components/CommonComponents';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
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
            New Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enter your new secure password details
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <PasswordField
                    label="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword !== '' && password !== confirmPassword}
                    helperText={confirmPassword !== '' && password !== confirmPassword ? 'Passwords do not match' : ''}
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
                    Update Password
                  </Button>
                </Stack>
              </form>
            ) : (
              <Stack spacing={2} textAlign="center">
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                  Password Restored!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your password has been reset successfully. You can now log back in.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.25 }}
                >
                  Return to Sign In
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

export default ResetPasswordPage;
