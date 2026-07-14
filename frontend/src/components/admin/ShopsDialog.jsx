import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import Badge from '../common/Badge';

// Quick breakdown of all shops (vendors) — opened from the "Total Shops" overview card.
const ShopsDialog = ({ open, onClose, vendors = [] }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle fontWeight={750}>All Shops ({vendors.length})</DialogTitle>
      <DialogContent dividers>
        {vendors.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No vendors onboarded yet.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Shop</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="right"><b>Trust Score</b></TableCell>
                <TableCell align="right"><b>Total Orders</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((v) => (
                <TableRow key={v.id || v.userId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{v.businessName || v.username || v.id}</Typography>
                    <Typography variant="caption" color="text.secondary">{v.userId || v.id}</Typography>
                  </TableCell>
                  <TableCell><Badge variant={v.approvalStatus || 'PENDING'}>{v.approvalStatus || 'PENDING'}</Badge></TableCell>
                  <TableCell align="right">{v.trustScore != null ? Math.round(v.trustScore) : '—'}</TableCell>
                  <TableCell align="right">{v.totalOrders ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShopsDialog;
