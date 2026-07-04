import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, InputAdornment, Avatar, Skeleton } from '@mui/material';
import { Search, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPlatformUsers, suspendUser, reactivateUser } from '../../features/admin/users/userSlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.adminUsers);

  const [search, setSearch] = useState('');
  
  // Guard targets
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [reactivateTarget, setReactivateTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchPlatformUsers());
  }, [dispatch]);

  const handleSuspendConfirm = () => {
    if (!suspendTarget) return;
    dispatch(suspendUser(suspendTarget.id))
      .unwrap()
      .then(() => {
        toast.success(`User ${suspendTarget.name} has been suspended.`);
        setSuspendTarget(null);
      })
      .catch((err) => toast.error(err || 'Failed to suspend user'));
  };

  const handleReactivateConfirm = () => {
    if (!reactivateTarget) return;
    dispatch(reactivateUser(reactivateTarget.id))
      .unwrap()
      .then(() => {
        toast.success(`User ${reactivateTarget.name} has been reactivated.`);
        setReactivateTarget(null);
      })
      .catch((err) => toast.error(err || 'Failed to reactivate user'));
  };

  const getFilteredUsers = () => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    );
  };

  const filteredUsers = getFilteredUsers();

  if (loading && users.length === 0) {
    return (
      <Box>
        <Skeleton variant="text" width="220px" height="40px" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Platform User Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor customer and merchant logins, assign access privileges, and suspend fraudulent users.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4, maxWidth: 500 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search accounts by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#9CA3AF" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no platform users corresponding to this search query."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell width={60}></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Profile Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Email Address</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Portal Role</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Account Status</Typography></TableCell>
                <TableCell align="right" width={180}><Typography variant="body2" fontWeight={750}>Action</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Avatar 
                      src={u.picture} 
                      alt={u.name}
                      sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}
                    >
                      {u.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell fontWeight={700} color="primary.main">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.suspended ? 'REJECTED' : 'APPROVED'}>
                      {u.suspended ? 'SUSPENDED' : 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    {u.suspended ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => setReactivateTarget(u)}
                        sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Reactivate
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setSuspendTarget(u)}
                        sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Suspend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Suspension Guard */}
      <ConfirmDialog
        open={!!suspendTarget}
        title="Suspend Platform User"
        message={`Are you sure you want to suspend '${suspendTarget?.name}'? Suspended users will immediately be blocked from logging into the portal or placing purchases.`}
        confirmText="Suspend User"
        isDestructive={true}
        onConfirm={handleSuspendConfirm}
        onCancel={() => setSuspendTarget(null)}
      />

      {/* Reactivation Guard */}
      <ConfirmDialog
        open={!!reactivateTarget}
        title="Reactivate Platform User"
        message={`Are you sure you want to reactivate the account for '${reactivateTarget?.name}'? They will be granted portal access and normal purchase permissions.`}
        confirmText="Reactivate User"
        isDestructive={false}
        onConfirm={handleReactivateConfirm}
        onCancel={() => setReactivateTarget(null)}
      />

    </Box>
  );
};

export default UsersPage;
