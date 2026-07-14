import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Stack, Divider, Skeleton } from '@mui/material';
import { AlertCircle, Scale } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDisputes, resolveDispute, escalateDispute } from '../../features/admin/disputes/disputeSlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const DisputesPage = () => {
  const dispatch = useAppDispatch();
  const { disputes, loading } = useAppSelector((state) => state.adminDisputes);

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // Guard triggers
  const [confirmCustomer, setConfirmCustomer] = useState(false);
  const [confirmVendor, setConfirmVendor] = useState(false);
  const [confirmEscalate, setConfirmEscalate] = useState(false);

  useEffect(() => {
    dispatch(fetchDisputes());
  }, [dispatch]);

  const handleResolveForCustomer = () => {
    if (!selectedDispute || !resolutionNotes.trim()) return;
    dispatch(resolveDispute({
      id: selectedDispute.id,
      notes: resolutionNotes.trim(),
      resolutionStatus: 'RESOLVED_FOR_CUSTOMER'
    }))
      .unwrap()
      .then(() => {
        toast.success('Dispute resolved in favor of the customer.');
        handleCloseDetails();
      })
      .catch((err) => toast.error(err || 'Failed to resolve dispute'));
  };

  const handleResolveForVendor = () => {
    if (!selectedDispute || !resolutionNotes.trim()) return;
    dispatch(resolveDispute({
      id: selectedDispute.id,
      notes: resolutionNotes.trim(),
      resolutionStatus: 'RESOLVED_FOR_VENDOR'
    }))
      .unwrap()
      .then(() => {
        toast.success('Dispute resolved in favor of the vendor.');
        handleCloseDetails();
      })
      .catch((err) => toast.error(err || 'Failed to resolve dispute'));
  };

  const handleEscalate = () => {
    if (!selectedDispute) return;
    dispatch(escalateDispute(selectedDispute.id))
      .unwrap()
      .then(() => {
        toast.success('Dispute escalated to board arbitration review.');
        handleCloseDetails();
      })
      .catch((err) => toast.error(err || 'Failed to escalate dispute'));
  };

  const handleCloseDetails = () => {
    setSelectedDispute(null);
    setResolutionNotes('');
    setConfirmCustomer(false);
    setConfirmVendor(false);
    setConfirmEscalate(false);
  };

  if (loading && disputes.length === 0) {
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
          Customer Disputes & Claims
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mediate transactional arguments, review customer claims, and submit final payouts resolutions.
        </Typography>
      </Box>

      {/* Disputes Table */}
      {disputes.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="All disputes cleared"
          description="There are no customer complaints or disputes awaiting platform arbitration."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell><Typography variant="body2" fontWeight={750}>Dispute ID</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Order ID</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Customer</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Dispute Reason</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Date Filed</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Status</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Action</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{d.id}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{String(d.orderId).slice(0, 14)}</TableCell>
                  <TableCell fontWeight={600}>{d.userId}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }} noWrap>{d.reason}</TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={d.status}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => setSelectedDispute(d)}
                      sx={{ fontWeight: 700, borderRadius: '16px' }}
                    >
                      Arbitrate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detailed Dispute Resolution Dialog */}
      <Dialog 
        open={!!selectedDispute} 
        onClose={handleCloseDetails} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        {selectedDispute && (
          <>
            <DialogTitle fontWeight={750} sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Scale size={22} color="#0F172A" />
              Arbitration Case #{selectedDispute.id}
            </DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Claims Details */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Order Reference</Typography>
                  <Typography variant="body2" fontWeight={700}>#{selectedDispute.orderId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Filing Date</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {new Date(selectedDispute.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Customer Complaint Details</Typography>
                  <Typography variant="body2" sx={{ p: 2, bgcolor: '#FBFBFA', border: '1px solid #E5E7EB', borderRadius: 2, fontStyle: 'italic' }}>
                    "{selectedDispute.reason}"
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              {/* Status details */}
              {selectedDispute.status !== 'OPEN' && selectedDispute.status !== 'ESCALATED' ? (
                <Box sx={{ p: 2, bgcolor: 'rgba(15, 118, 110, 0.05)', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={750} color="primary.main" sx={{ mb: 0.5 }}>
                    Arbitration Final Ruling: {selectedDispute.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ruling Notes: {selectedDispute.resolutionNotes}
                  </Typography>
                </Box>
              ) : (
                /* Resolution input fields */
                <Stack spacing={2}>
                  <Typography variant="body2" fontWeight={750}>Ruling Notes & Arbitration Justification</Typography>
                  <TextField
                    required
                    multiline
                    rows={3}
                    fullWidth
                    label="Resolution Notes"
                    placeholder="Provide details backing this decision (e.g. tracking confirms delivery, refund issued to credit card)."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                  
                  {/* Actions */}
                  <Grid container spacing={2} sx={{ pt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        disabled={!resolutionNotes.trim()}
                        onClick={() => setConfirmCustomer(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        Refund Customer
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={!resolutionNotes.trim()}
                        onClick={() => setConfirmVendor(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        Payout Vendor
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => setConfirmEscalate(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        Escalate
                      </Button>
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDetails} color="inherit" sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirmation Overlays */}
      <ConfirmDialog
        open={confirmCustomer}
        title="Refund Customer & Settle Claim"
        message={`Are you sure you want to resolve this claim in favor of the customer? A full refund of the item price will be charged back from the vendor and credited to the buyer.`}
        confirmText="Confirm Refund"
        isDestructive={true}
        onConfirm={handleResolveForCustomer}
        onCancel={() => setConfirmCustomer(false)}
      />

      <ConfirmDialog
        open={confirmVendor}
        title="Payout Vendor & Dismiss Claim"
        message={`Are you sure you want to dismiss this complaint and release payouts to the vendor? This action denies the customer's claim for refunds.`}
        confirmText="Release Payout"
        isDestructive={false}
        onConfirm={handleResolveForVendor}
        onCancel={() => setConfirmVendor(false)}
      />

      <ConfirmDialog
        open={confirmEscalate}
        title="Escalate Dispute Case"
        message={`Are you sure you want to escalate this complaint? This marks the case as ESCALATED and moves it to the senior platform compliance committee.`}
        confirmText="Confirm Escalation"
        isDestructive={true}
        onConfirm={handleEscalate}
        onCancel={() => setConfirmEscalate(false)}
      />

    </Box>
  );
};

export default DisputesPage;
