import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, registerCustomer, registerVendor } from '../features/auth/authSlice';
import {
  Box, Card, CardContent, Typography, Button, Grid,
  Tabs, Tab, TextField, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, InputAdornment, IconButton, Collapse
} from '@mui/material';
import { ShoppingBag, Eye, EyeOff, Key, User as UserIcon, HelpCircle, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

const SEEDED_CREDS = [
  { label: 'CUSTOMER', username: 'user', password: 'password123', color: 'secondary.main' },
  { label: 'VENDOR', username: 'vendor', password: 'password123', color: 'secondary.main' },
  { label: 'ADMIN', username: 'admin', password: 'password123', color: '#38BDF8' },
];

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user: authUser, loading } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0); // 0 = Sign In, 1 = Register
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(true);

  // Sign In form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error('Please enter your username and password.');
      return;
    }
    try {
      await dispatch(login({ username: loginUsername.trim(), password: loginPassword })).unwrap();
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err || 'Invalid username or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regFirstName || !regLastName) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (regRole === 'VENDOR' && !regBusinessName) {
      toast.error('Business name is required for vendor accounts.');
      return;
    }
    setRegLoading(true);
    try {
      if (regRole === 'VENDOR') {
        await dispatch(registerVendor({
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          businessName: regBusinessName.trim(),
          businessAddress: '',
          taxId: '',
        })).unwrap();
      } else {
        await dispatch(registerCustomer({
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          shippingAddress: '',
          phoneNumber: '',
        })).unwrap();
      }
      toast.success('Registration successful! Please sign in.');
      setLoginUsername(regUsername);
      setLoginPassword('');
      setActiveTab(0);
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegFirstName('');
      setRegLastName('');
      setRegBusinessName('');
      setRegRole('CUSTOMER');
    } catch (err) {
      toast.error(err || 'Failed to create account.');
    } finally {
      setRegLoading(false);
    }
  };

  const prefillCreds = (cred) => {
    setActiveTab(0);
    setLoginUsername(cred.username);
    setLoginPassword(cred.password);
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
            <Box component="form" onSubmit={handleLogin} sx={{ textAlign: 'left' }}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
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
                disabled={loading}
                sx={{ mt: 3, mb: 1, py: 1.25, fontWeight: 700 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          )}

          {/* TAB 1: REGISTER */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleRegister} sx={{ textAlign: 'left' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" margin="normal" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" margin="normal" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><UserIcon size={18} /></InputAdornment>),
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
                  startAdornment: (<InputAdornment position="start"><Mail size={18} /></InputAdornment>),
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
                  startAdornment: (<InputAdornment position="start"><Key size={18} /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {regRole === 'VENDOR' && (
                <TextField
                  fullWidth
                  label="Business Name"
                  variant="outlined"
                  margin="normal"
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                />
              )}

              <FormControl component="fieldset" sx={{ mt: 2, display: 'block' }}>
                <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>Register Account Type</FormLabel>
                <RadioGroup row value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                  <FormControlLabel value="CUSTOMER" control={<Radio size="small" color="secondary" />} label={<Typography variant="body2" fontWeight={700}>Customer Portal</Typography>} />
                  <FormControlLabel value="VENDOR" control={<Radio size="small" color="secondary" />} label={<Typography variant="body2" fontWeight={700}>Vendor Shop</Typography>} />
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disabled={regLoading}
                sx={{ mt: 2, mb: 1, py: 1.25, fontWeight: 700 }}
              >
                {regLoading ? 'Creating Account...' : 'Register Now'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Seeded demo credentials */}
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
            {SEEDED_CREDS.map((cred) => (
              <Grid item xs={4} key={cred.username}>
                <Card
                  sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', height: '100%', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                  onClick={() => prefillCreds(cred)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: cred.color, fontWeight: 800 }}>{cred.label}</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'monospace' }} noWrap>{cred.username}</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.400' }}>
                      <span style={{ fontFamily: 'monospace' }}>{cred.password}</span>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', textAlign: 'center', mb: 2 }}>
            💡 Click a card to prefill the sign-in form with seeded credentials.
          </Typography>
        </Collapse>
      </Box>
    </Box>
  );
};

export default LoginPage;
