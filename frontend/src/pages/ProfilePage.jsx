import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2'; // MUI Grid v2
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

// Shared components & helper services
import authService from '../services/authService';
import { updateProfile } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/notificationSlice';
import { StatusBadge } from '../components/CommonComponents';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields local state
  const [emailInput, setEmailInput] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfileData(data);
      setEmailInput(data.email);
      dispatch(updateProfile(data)); // Sync with Redux store
    } catch (e) {
      console.error('Failed to load user profile: ', e);
      // Fallback in case backend is offline
      setProfileData(user || { username: 'admin', email: 'admin@vendra.com', roles: ['ROLE_ADMIN', 'ROLE_USER'], enabled: true });
      setEmailInput(user?.email || 'admin@vendra.com');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      // Simulate profile edit success
      const updated = { ...profileData, email: emailInput };
      setProfileData(updated);
      dispatch(updateProfile(updated));
      dispatch(showNotification({
        message: 'Profile updated successfully!',
        severity: 'success'
      }));
      setSaving(false);
    }, 800);
  };

  const initial = profileData?.username ? profileData.username.charAt(0).toUpperCase() : 'U';

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal credentials, session details, and roles.
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {profileData && (
        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                    mb: 3
                  }}
                >
                  {initial}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {profileData.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profileData.email}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                  {profileData.roles?.map((role) => (
                    <StatusBadge key={role} status={role} />
                  ))}
                </Stack>

                <Divider sx={{ width: '100%', my: 2 }} />

                <Box sx={{ width: '100%', textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Account Status</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Enabled</Typography>
                    <StatusBadge status={profileData.enabled ? 'ACTIVE' : 'INACTIVE'} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Edit Profile Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Edit Profile Info
                </Typography>
                
                <form onSubmit={handleSave}>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileData.username}
                        disabled
                        helperText="Username cannot be altered"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        Reset Password (UI Mock)
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        disabled={saving}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        disabled={saving}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={saving}
                      >
                        {saving ? 'Saving changes...' : 'Save Profile Details'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ProfilePage;
