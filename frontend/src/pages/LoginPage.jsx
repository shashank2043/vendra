import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import LayersIcon from '@mui/icons-material/Layers';

// Actions & Helpers
import { loginSuccess, setLoading, setError } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/notificationSlice';
import authService from '../services/authService';
import { PasswordField } from '../components/CommonComponents';

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.auth.loading);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      dispatch(setLoading(true));
      try {
        const loginData = await authService.login(values.username, values.password);
        
        // loginData contains accessToken and user details
        dispatch(loginSuccess(loginData));
        
        dispatch(showNotification({
          message: `Welcome back, ${loginData.user.username}!`,
          severity: 'success',
        }));
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Login error: ', err);
        const errMsg = err.response?.data?.message || 'Invalid username or password. Please try again.';
        dispatch(setError(errMsg));
        dispatch(showNotification({
          message: errMsg,
          severity: 'error',
        }));
      } finally {
        dispatch(setLoading(false));
      }
    },
  });

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
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Access the Vendra developer dashboard
          </Typography>
        </Box>

        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  autoComplete="username"
                  disabled={loading}
                />
                
                <PasswordField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <Box display="flex" justifyContent="flex-end">
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ py: 1.25 }}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              color="primary"
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
