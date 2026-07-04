import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tabs, Tab, Skeleton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
import { UserCheck, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchVendorApplications, approveVendor, rejectVendor } from '../../features/admin/vendorApprovals/vendorSlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const VendorApprovalsPage = () => {
  const dispatch = useAppDispatch();
  const { applications, loading } = useAppSelector((state) => state.adminVendors);

  const [activeTab, setActiveTab] = useState(0);
  
  // State-change confirmation anchors
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(fetchVendorApplications());
  }, [dispatch]);

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    dispatch(approveVendor(approveTarget.id))
      .unwrap()
      .then(() => {
        toast.success(`Approved application for ${approveTarget.businessName}`);
        setApproveTarget(null);
      })
      .catch((err) => toast.error(err || 'Failed to approve application'));
  };

  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!rejectTarget || !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    dispatch(rejectVendor({ id: rejectTarget.id, reason: rejectionReason.trim() }))
      .unwrap()
      .then(() => {
        toast.success(`Rejected application for ${rejectTarget.businessName}`);
        setRejectTarget(null);
        setRejectionReason('');
      })
      .catch((err) => toast.error(err || 'Failed to reject application'));
  };

  const getFilteredApplications = () => {
    switch (activeTab) {
      case 1: // Approved
        return applications.filter(v => v.approvalStatus === 'APPROVED');
      case 2: // Rejected
        return applications.filter(v => v.approvalStatus === 'REJECTED');
      default: // Pending
        return applications.filter(v => v.approvalStatus === 'PENDING');
    }
  };

  const filteredApps = getFilteredApplications();

  if (loading && applications.length === 0) {
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
          Vendor Application Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review artisan applications, verify telephone credentials, and authorize storefront activation.
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label={`Pending (${applications.filter(v => v.approvalStatus === 'PENDING').length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Approved (${applications.filter(v => v.approvalStatus === 'APPROVED').length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Rejected (${applications.filter(v => v.approvalStatus === 'REJECTED').length})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Main Table */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No applications found"
          description="There are no vendor store registrations under this status category."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell><Typography variant="body2" fontWeight={750}>Business Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Phone</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Warehouse Address</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Date Applied</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Status</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApps.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{v.businessName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {v.description || 'Artisan Seller'}
                    </Typography>
                  </TableCell>
                  <TableCell>{v.contactPhone || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.825rem', color: 'text.secondary', maxWidth: 220 }}>
                    {v.warehouseAddress || 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(v.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={v.approvalStatus}>
                      {v.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    {v.approvalStatus === 'PENDING' ? (
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check size={14} />}
                          onClick={() => setApproveTarget(v)}
                          sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<X size={14} />}
                          onClick={() => setRejectTarget(v)}
                          sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {v.approvalStatus === 'APPROVED' ? 'Authorized' : `Rejected: ${v.rejectionReason || 'No details'}`}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Guard Confirmations */}
      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Shop Registration"
        message={`Are you sure you want to authorize '${approveTarget?.businessName}' to open their shop? They will be allowed to sell products and manage warehouse orders immediately.`}
        confirmText="Approve"
        isDestructive={false}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject dialog with reason input */}
      <Dialog 
        open={!!rejectTarget} 
        onClose={() => { setRejectTarget(null); setRejectionReason(''); }}
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <Box component="form" onSubmit={handleRejectConfirm}>
          <DialogTitle fontWeight={700}>Reject Application</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: 280, sm: 400 } }}>
            <DialogContentText color="text.secondary">
              Please state the reason for rejecting '{rejectTarget?.businessName}'. This will be displayed in their vendor portal.
            </DialogContentText>
            <TextField
              required
              multiline
              rows={3}
              fullWidth
              label="Rejection Reason"
              placeholder="E.g. Contact phone could not be verified / warehouse address outside courier zone."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => { setRejectTarget(null); setRejectionReason(''); }} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" sx={{ fontWeight: 600 }}>
              Reject Application
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
};

export default VendorApprovalsPage;
