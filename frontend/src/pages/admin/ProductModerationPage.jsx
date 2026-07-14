import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, FormControl, InputLabel, Select, MenuItem, Skeleton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Grid } from '@mui/material';
import { Check, X, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchModerationQueue, approveProduct, rejectProduct } from '../../features/admin/productModeration/moderationSlice';
import { formatMoney, selectCurrency } from '../../features/currency/currencySlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ProductModerationPage = () => {
  const dispatch = useAppDispatch();
  const { queue, loading } = useAppSelector((state) => state.adminModeration);
  const currency = useAppSelector(selectCurrency);

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [catFilter, setCatFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');

  // Confirmation hooks
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(fetchModerationQueue());

    axiosInstance.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    axiosInstance.get('/api/v1/vendors')
      .then(res => setVendors(res.data))
      .catch(err => console.error(err));
  }, [dispatch]);

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    dispatch(approveProduct(approveTarget.id))
      .unwrap()
      .then(() => {
        toast.success(`Product '${approveTarget.name}' approved successfully.`);
        setApproveTarget(null);
      })
      .catch((err) => toast.error(err || 'Failed to approve product'));
  };

  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!rejectTarget || !rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    dispatch(rejectProduct({ id: rejectTarget.id, reason: rejectionReason.trim() }))
      .unwrap()
      .then(() => {
        toast.success(`Product '${rejectTarget.name}' has been rejected.`);
        setRejectTarget(null);
        setRejectionReason('');
      })
      .catch((err) => toast.error(err || 'Failed to reject product'));
  };

  const getFilteredQueue = () => {
    // Only display products with PENDING status
    let list = queue.filter(p => p.moderationStatus === 'PENDING');

    if (catFilter !== 'ALL') {
      list = list.filter(p => p.category === catFilter);
    }
    if (vendorFilter !== 'ALL') {
      list = list.filter(p => p.vendorId === vendorFilter);
    }
    return list;
  };

  const filteredQueue = getFilteredQueue();

  const getCategoryName = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'Unknown';
  };

  const getVendorName = (vId) => {
    const found = vendors.find(v => v.id === vId);
    return found ? found.businessName : 'Unknown';
  };

  if (loading && queue.length === 0) {
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
          Product Moderation Queue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Audit newly registered artisan products for branding compliance, high-resolution media, and safety rules.
        </Typography>
      </Box>

      {/* Filter Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter-label">Filter Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={catFilter}
              label="Filter Category"
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="vendor-filter-label">Filter Shop</InputLabel>
            <Select
              labelId="vendor-filter-label"
              value={vendorFilter}
              label="Filter Shop"
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Shops</MenuItem>
              {vendors.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.businessName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Queue Table */}
      {filteredQueue.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="All clear!"
          description="There are no pending handcrafted listings requiring moderation safety review."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell width={80}><Typography variant="body2" fontWeight={750}>Image</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Product Details</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Category</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Shop Owner</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Price</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Audit Action</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueue.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box 
                      component="img"
                      src={p.imageUrl || p.imageUrls?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                      alt={p.name}
                      sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #E5E7EB' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220 }} noWrap>
                      {p.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.category || 'Uncategorized'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{getVendorName(p.vendorId)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{formatMoney(p.price, currency)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check size={14} />}
                        onClick={() => setApproveTarget(p)}
                        sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<X size={14} />}
                        onClick={() => setRejectTarget(p)}
                        sx={{ borderRadius: '16px', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Safety Confirmations */}
      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Handcrafted Product"
        message={`Are you sure you want to approve '${approveTarget?.name}'? This product will immediately be published and listed under the customer store category catalogue.`}
        confirmText="Approve"
        isDestructive={false}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Rejection input dialog */}
      <Dialog 
        open={!!rejectTarget} 
        onClose={() => { setRejectTarget(null); setRejectionReason(''); }}
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <Box component="form" onSubmit={handleRejectConfirm}>
          <DialogTitle fontWeight={700}>Reject Product Listing</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: 280, sm: 400 } }}>
            <DialogContentText color="text.secondary">
              Provide feedback for rejecting '{rejectTarget?.name}'. This notice will be visible in the vendor's products catalog.
            </DialogContentText>
            <TextField
              required
              multiline
              rows={3}
              fullWidth
              label="Audit Feedback Notes"
              placeholder="E.g. Description is too short / product images resolution low."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => { setRejectTarget(null); setRejectionReason(''); }} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" sx={{ fontWeight: 600 }}>
              Reject Listing
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
};

export default ProductModerationPage;
