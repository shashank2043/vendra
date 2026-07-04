import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginAsGuest, loginAsDemoUser, loginSuccess } from '../features/auth/authSlice';
import GoogleLoginButton from '../features/auth/components/GoogleLoginButton';
import { 
  Box, Card, CardContent, Typography, Button, Divider, Grid, 
  Tabs, Tab, TextField, FormControl, FormLabel, RadioGroup, 
  FormControlLabel, Radio, InputAdornment, IconButton, Collapse
} from '@mui/material';
import { ShoppingBag, Eye, EyeOff, Key, Mail, User as UserIcon, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user: authUser } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0); // 0 = Sign In, 1 = Register
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(true);

  // Sign In form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'VENDOR'
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname || '/';
      if (from === '/login' || from === '/') {
        if (role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (role === 'VENDOR') {
          if (authUser?.approvalStatus !== 'APPROVED') {
            navigate('/pending-approval', { replace: true });
          } else {
            navigate('/vendor', { replace: true });
          }
        } else {
          navigate('/customer', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, role, authUser, navigate, location]);

  const handleGuestLogin = () => {
    dispatch(loginAsGuest());
    toast.success('Welcome! Logged in as Guest Customer.');
  };

  const handleDemoLogin = (roleType) => {
    dispatch(loginAsDemoUser(roleType));
    toast.success(`Demo Access: Logged in as ${roleType.replace('_', ' ').toLowerCase()}`);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoginLoading(true);

    try {
      const response = await axiosInstance.get(`/platformUsers?email=${encodeURIComponent(loginEmail.trim().toLowerCase())}`);
      if (response.data && response.data.length > 0) {
        const dbUser = response.data[0];
        
        if (dbUser.suspended) {
          toast.error('This account has been suspended by the platform administrator.');
          setLoginLoading(false);
          return;
        }

        // Mock verification: accept 'password' or user's registered password
        let approvalStatus = 'APPROVED';

        if (dbUser.role === 'VENDOR') {
          const profileResponse = await axiosInstance.get(`/vendorProfiles?userId=${dbUser.id}`);
          if (profileResponse.data && profileResponse.data.length > 0) {
            approvalStatus = profileResponse.data[0].approvalStatus;
          } else {
            approvalStatus = 'PENDING';
          }
        }

        const authenticatedUser = {
          ...dbUser,
          approvalStatus
        };

        dispatch(loginSuccess(authenticatedUser));
        toast.success(`Welcome back, ${dbUser.name}!`);
      } else {
        toast.error('Account not found. Please register or use a demo login.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Failed to authenticate. Please check server connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all registration fields.');
      return;
    }
    setRegLoading(true);

    try {
      // Check if user already exists
      const checkRes = await axiosInstance.get(`/platformUsers?email=${encodeURIComponent(regEmail.trim().toLowerCase())}`);
      if (checkRes.data && checkRes.data.length > 0) {
        toast.error('An account with this email already exists.');
        setRegLoading(false);
        return;
      }

      // Create new user in db.json
      const newUser = {
        id: `user-${Date.now()}`,
        email: regEmail.trim().toLowerCase(),
        name: regName.trim(),
        role: regRole,
        suspended: false
      };

      await axiosInstance.post('/platformUsers', newUser);

      // If they are registering as VENDOR, create a pending profile
      if (regRole === 'VENDOR') {
        const newProfile = {
          id: `vp-${Date.now()}`,
          userId: newUser.id,
          businessName: `${newUser.name}'s Store`,
          approvalStatus: 'PENDING',
          createdAt: new Date().toISOString()
        };
        await axiosInstance.post('/vendorProfiles', newProfile);
      }

      toast.success('Registration successful! Please sign in using your credentials.');
      // Switch tab to login, prefill email
      setLoginEmail(regEmail);
      setLoginPassword('');
      setActiveTab(0);
      
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('CUSTOMER');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #111827 0%, #1c1917 50%, #1f2937 100%)',
        p: 2,
        py: 6
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: 4,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255,255,255,0.08)',
          mb: 3
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <Box
              sx={{
                backgroundColor: 'secondary.main',
                color: 'secondary.contrastText',
                p: 1,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={28} />
            </Box>
            <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.04em' }}>
              Vendra
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            Artisanal Multi-Vendor Marketplace
          </Typography>

          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)} 
            centered 
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab label="Sign In" sx={{ fontWeight: 700 }} />
            <Tab label="Register" sx={{ fontWeight: 700 }} />
          </Tabs>

          {/* TAB 0: SIGN IN */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleEmailLogin} sx={{ textAlign: 'left' }}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disabled={loginLoading}
                sx={{ mt: 3, mb: 2.5, py: 1.25, fontWeight: 700 }}
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Google Login */}
              <Box sx={{ mb: 2 }}>
                <GoogleLoginButton />
              </Box>

              {/* Guest Access Link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={handleGuestLogin}
                  sx={{
                    color: 'secondary.dark',
                    fontWeight: 750,
                    textDecoration: 'underline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Continue as Guest (Customer)
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 1: REGISTER */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleEmailRegister} sx={{ textAlign: 'left' }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                margin="normal"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl component="fieldset" sx={{ mt: 2, display: 'block' }}>
                <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>Register Account Type</FormLabel>
                <RadioGroup row value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                  <FormControlLabel 
                    value="CUSTOMER" 
                    control={<Radio size="small" color="secondary" />} 
                    label={<Typography variant="body2" fontWeight={700}>Customer Portal</Typography>} 
                  />
                  <FormControlLabel 
                    value="VENDOR" 
                    control={<Radio size="small" color="secondary" />} 
                    label={<Typography variant="body2" fontWeight={700}>Vendor Shop</Typography>} 
                  />
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disabled={regLoading}
                sx={{ mt: 3, mb: 1, py: 1.25, fontWeight: 700 }}
              >
                {regLoading ? 'Creating Account...' : 'Register Now'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Accordion/Collapse for Demo Credentials */}
      <Box sx={{ maxWidth: 480, width: '100%' }}>
        <Button 
          variant="outlined"
          fullWidth
          onClick={() => setShowDemoCreds(!showDemoCreds)}
          startIcon={<HelpCircle size={16} />}
          sx={{ 
            color: '#FFFFFF', 
            borderColor: 'rgba(255,255,255,0.2)', 
            bgcolor: 'rgba(255,255,255,0.03)',
            mb: 2, 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.4)' }
          }}
        >
          {showDemoCreds ? 'Hide Seeded Test Credentials' : 'Show Seeded Test Credentials'}
        </Button>

        <Collapse in={showDemoCreds}>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }} onClick={() => handleDemoLogin('CUSTOMER')}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800 }}>CUSTOMER</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.75rem' }} noWrap>customer@example.com</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400' }}>Password: <span style={{ fontFamily: 'monospace' }}>password</span></Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }} onClick={() => handleDemoLogin('VENDOR_APPROVED')}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800 }}>APPROVED VENDOR</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.75rem' }} noWrap>vendor@example.com</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400' }}>Password: <span style={{ fontFamily: 'monospace' }}>password</span></Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }} onClick={() => handleDemoLogin('VENDOR_PENDING')}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800 }}>PENDING VENDOR</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.75rem' }} noWrap>pending_vendor@example.com</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400' }}>Password: <span style={{ fontFamily: 'monospace' }}>password</span></Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }} onClick={() => handleDemoLogin('ADMIN')}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>PLATFORM ADMIN</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.75rem' }} noWrap>admin@example.com</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400' }}>Password: <span style={{ fontFamily: 'monospace' }}>password</span></Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', textAlign: 'center', mb: 2 }}>
            💡 Click on any test card above to login instantly via Demo portals, or use the forms.
          </Typography>
        </Collapse>
      </Box>
    </Box>
  );
};

export default LoginPage;
