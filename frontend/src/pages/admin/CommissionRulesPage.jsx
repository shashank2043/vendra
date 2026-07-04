import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, InputAdornment } from '@mui/material';
import { Plus, Edit, Check, X, Percent } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCommissionRules, createCommissionRule, updateCommissionRule } from '../../features/admin/commissionRules/commissionSlice';
import axiosInstance from '../../api/axiosInstance';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const CommissionRulesPage = () => {
  const dispatch = useAppDispatch();
  const { rules, loading } = useAppSelector((state) => state.adminCommission);

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingRate, setEditingRate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form details
  const [newCatName, setNewCatName] = useState('');
  const [newRate, setNewRate] = useState('');

  useEffect(() => {
    dispatch(fetchCommissionRules());

    axiosInstance.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, [dispatch]);

  const handleEditClick = (rule) => {
    setEditingId(rule.id);
    setEditingRate((rule.commissionRate * 100).toString());
  };

  const handleSaveEdit = (ruleId) => {
    const rateVal = parseFloat(editingRate);
    if (isNaN(rateVal) || rateVal < 0 || rateVal > 100) {
      toast.error('Please enter a valid rate percentage between 0 and 100.');
      return;
    }

    dispatch(updateCommissionRule({ id: ruleId, data: { commissionRate: rateVal / 100 } }))
      .unwrap()
      .then(() => {
        toast.success('Commission rate updated successfully!');
        setEditingId(null);
      })
      .catch((err) => toast.error(err || 'Failed to update commission rule'));
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    const rateVal = parseFloat(newRate);
    if (!newCatName || isNaN(rateVal) || rateVal < 0 || rateVal > 100) {
      toast.error('Please enter valid details.');
      return;
    }

    dispatch(createCommissionRule({ categoryName: newCatName, commissionRate: rateVal / 100 }))
      .unwrap()
      .then(() => {
        toast.success('Commission rule created successfully!');
        setModalOpen(false);
        setNewCatName('');
        setNewRate('');
      })
      .catch((err) => toast.error(err || 'Failed to create commission rule'));
  };

  if (loading && rules.length === 0) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Commission Rules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define standard platform fee rates mapped to product categories.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: '24px', px: 3 }}
        >
          Add Custom Rule
        </Button>
      </Box>

      {/* Rules Table */}
      {rules.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No commission rules"
          description="Create your first category commission rate rule to begin managing platform revenue splits."
          actionText="Add Custom Rule"
          onActionClick={() => setModalOpen(true)}
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell><Typography variant="body2" fontWeight={750}>Category Identifier / Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Standard Platform Commission Rate (%)</Typography></TableCell>
                <TableCell align="right" width={150}><Typography variant="body2" fontWeight={750}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => {
                const isEditing = editingId === rule.id;

                return (
                  <TableRow key={rule.id} hover>
                    <TableCell fontWeight={700} color="primary.main">
                      {rule.categoryName}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={editingRate}
                            onChange={(e) => setEditingRate(e.target.value)}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              style: { width: 100, fontWeight: 700, padding: '4px' }
                            }}
                          />
                          <IconButton size="small" color="success" onClick={() => handleSaveEdit(rule.id)}>
                            <Check size={16} />
                          </IconButton>
                          <IconButton size="small" color="inherit" onClick={() => setEditingId(null)}>
                            <X size={16} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Typography variant="body2" fontWeight={700}>
                          {(rule.commissionRate * 100).toFixed(0)}%
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {!isEditing && (
                        <Button
                          size="small"
                          startIcon={<Edit size={14} />}
                          onClick={() => handleEditClick(rule)}
                          sx={{ fontWeight: 700 }}
                        >
                          Modify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add rule Modal Dialog */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <Box component="form" onSubmit={handleCreateRule}>
          <DialogTitle fontWeight={750}>Create Category Commission Rule</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: { xs: 280, sm: 400 } }}>
            <TextField
              required
              fullWidth
              label="Category / Tag Name"
              placeholder="E.g. Custom Stoneware / Leathercrafts"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <TextField
              required
              fullWidth
              type="number"
              label="Standard Commission Percentage"
              placeholder="15"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                min: 0,
                max: 100
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              Create Rule
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CommissionRulesPage;
