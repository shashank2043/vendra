import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Container, CircularProgress } from '@mui/material';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, updateApprovalStatus } from '../features/auth/authSlice';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleCheckStatus = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const response = await axiosInstance.get(`/api/v1/vendors/${user.username}`);
      const profile = response.data;
      if (profile && profile.approvalStatus) {
        if (profile.approvalStatus === 'APPROVED') {
          dispatch(updateApprovalStatus('APPROVED'));
          toast.success('Your vendor account has been approved! Redirecting...');
          navigate('/vendor', { replace: true });
        } else {
          toast.info(`Application status: ${profile.approvalStatus}`);
        }
      } else {
        toast.warning('No vendor profile found for this account.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Failed to check approval status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FBFBFA',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 4 }}>
          <CardContent>
            <Box
              sx={{
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                p: 3,
                borderRadius: '50%',
                mb: 3,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={48} color="#D97706" />
            </Box>

            <Typography variant="h4" fontWeight={800} color="primary" sx={{ mb: 2, letterSpacing: '-0.02em' }}>
              Approval Pending
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Hi <strong>{user?.name || 'Vendor'}</strong>, your vendor registration is currently being reviewed.
              Once the Vendra admin team approves your business, you'll be granted full portal access.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckStatus}
                disabled={checking}
                startIcon={checking ? <CircularProgress size={16} color="inherit" /> : <RefreshCw size={16} />}
                sx={{ px: 4, py: 1.2, width: '100%', maxWidth: 280 }}
              >
                {checking ? 'Checking status...' : 'Check Status'}
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                startIcon={<LogOut size={16} />}
                sx={{ px: 4, py: 1.2, width: '100%', maxWidth: 280 }}
              >
                Sign Out / Switch Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PendingApprovalPage;
