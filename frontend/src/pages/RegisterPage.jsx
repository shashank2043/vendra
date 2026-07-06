import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Container,
  LinearProgress, Link, ToggleButtonGroup, ToggleButton, Grid
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import { registerCustomer, registerVendor } from '../features/auth/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.auth.loading);

  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'VENDOR'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    // customer
    shippingAddress: '',
    phoneNumber: '',
    // vendor
    businessName: '',
    businessAddress: '',
    taxId: '',
  });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.firstName || !form.lastName) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      if (role === 'VENDOR') {
        if (!form.businessName) {
          toast.error('Business name is required.');
          return;
        }
        await dispatch(registerVendor({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          businessName: form.businessName.trim(),
          businessAddress: form.businessAddress.trim(),
          taxId: form.taxId.trim(),
        })).unwrap();
      } else {
        await dispatch(registerCustomer({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          shippingAddress: form.shippingAddress.trim(),
          phoneNumber: form.phoneNumber.trim(),
        })).unwrap();
      }
      toast.success('Account created successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Failed to create account. Username or email might be taken.');
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
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '12px',
              p: 1.5,
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <LayersIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create a new Vendra account
          </Typography>
        </Box>

        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
          <CardContent sx={{ p: 4 }}>
            <ToggleButtonGroup
              color="primary"
              exclusive
              fullWidth
              value={role}
              onChange={(e, val) => val && setRole(val)}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="CUSTOMER">Customer</ToggleButton>
              <ToggleButton value="VENDOR">Vendor</ToggleButton>
            </ToggleButtonGroup>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="First Name" value={form.firstName} onChange={update('firstName')} disabled={loading} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Last Name" value={form.lastName} onChange={update('lastName')} disabled={loading} />
                  </Grid>
                </Grid>

                <TextField fullWidth label="Username" value={form.username} onChange={update('username')} disabled={loading} />
                <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={update('email')} disabled={loading} />
                <TextField fullWidth label="Password" type="password" value={form.password} onChange={update('password')} disabled={loading} />

                {role === 'CUSTOMER' ? (
                  <>
                    <TextField fullWidth label="Shipping Address" value={form.shippingAddress} onChange={update('shippingAddress')} disabled={loading} />
                    <TextField fullWidth label="Phone Number" value={form.phoneNumber} onChange={update('phoneNumber')} disabled={loading} />
                  </>
                ) : (
                  <>
                    <TextField fullWidth label="Business Name" value={form.businessName} onChange={update('businessName')} disabled={loading} />
                    <TextField fullWidth label="Business Address" value={form.businessAddress} onChange={update('businessAddress')} disabled={loading} />
                    <TextField fullWidth label="Tax ID" value={form.taxId} onChange={update('taxId')} disabled={loading} />
                  </>
                )}

                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ py: 1.25, mt: 1 }}
                >
                  {loading ? 'Registering...' : 'Sign Up'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;
