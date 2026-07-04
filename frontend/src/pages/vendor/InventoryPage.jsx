import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Collapse, Skeleton, Stack } from '@mui/material';
import { AlertTriangle, Check, X, Edit, Boxes } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchInventory, updateStock } from '../../features/vendor/inventory/inventorySlice';
import axiosInstance from '../../api/axiosInstance';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const InventoryPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: products, loading } = useAppSelector((state) => state.vendorInventory);

  const [vendor, setVendor] = useState(null);
  const [categories, setCategories] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingStock, setEditingStock] = useState('');

  useEffect(() => {
    if (!user) return;
    axiosInstance.get(`/vendorProfiles?userId=${user.id}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          const v = res.data[0];
          setVendor(v);
          dispatch(fetchInventory(v.id));
        }
      });

    axiosInstance.get('/categories')
      .then(res => {
        const map = {};
        res.data.forEach(c => {
          map[c.id] = c.name;
        });
        setCategories(map);
      });
  }, [dispatch, user]);

  const handleEditClick = (productId, currentStock) => {
    setEditingId(productId);
    setEditingStock(currentStock.toString());
  };

  const handleSaveStock = (productId) => {
    const stockVal = parseInt(editingStock);
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error('Please enter a valid stock level.');
      return;
    }

    dispatch(updateStock({ productId, stock: stockVal }))
      .unwrap()
      .then(() => {
        toast.success('Stock level updated successfully!');
        setEditingId(null);
      })
      .catch((err) => toast.error(err || 'Failed to update stock'));
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const lowStockItems = products.filter(p => p.stock < 5);

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width="180px" height="40px" />
        </Box>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Inventory Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track warehouse stock count, adjust inventory, and review restock triggers.
        </Typography>
      </Box>

      {/* Restock Alert Banner */}
      <Collapse in={lowStockItems.length > 0}>
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: 'rgba(190, 18, 60, 0.06)',
            border: '1.5px solid rgba(190, 18, 60, 0.15)',
            color: '#BE123C',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <AlertTriangle size={24} style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" fontWeight={750} sx={{ mb: 0.5 }}>
              Restock Warning Alert
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              The following products are running critically low on inventory (below threshold of 5 units). Please restock soon:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5, gap: 1 }}>
              {lowStockItems.map(p => (
                <Box
                  key={p.id}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'rgba(190, 18, 60, 0.1)',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {p.name} ({p.stock} left)
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Collapse>

      {/* Inventory Table */}
      {products.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No items in warehouse"
          description="Once you add products to your catalog, they will appear here to manage inventory levels."
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell width={80}><Typography variant="body2" fontWeight={750}>Image</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Category</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Status</Typography></TableCell>
                <TableCell width={200}><Typography variant="body2" fontWeight={750}>Stock Level</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => {
                const isLowStock = p.stock < 5;
                const isEditing = editingId === p.id;

                return (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box 
                        component="img"
                        src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100&auto=format&fit=crop'}
                        alt={p.name}
                        sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #E5E7EB' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sku ID: {p.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{categories[p.categoryId] || 'Handcrafted'}</TableCell>
                    <TableCell>
                      <Badge variant={p.moderationStatus || 'PENDING'}>
                        {p.moderationStatus || 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={editingStock}
                            onChange={(e) => setEditingStock(e.target.value)}
                            inputProps={{ min: 0, style: { width: 60, fontWeight: 700, padding: '6px 10px' } }}
                            sx={{ mt: 0 }}
                          />
                          <IconButton size="small" color="success" onClick={() => handleSaveStock(p.id)}>
                            <Check size={16} />
                          </IconButton>
                          <IconButton size="small" color="inherit" onClick={handleCancelClick}>
                            <X size={16} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} color={isLowStock ? 'error.main' : 'text.primary'}>
                            {p.stock}
                          </Typography>
                          {isLowStock && (
                            <Box sx={{ display: 'inline-flex', color: 'error.main' }} title="Low Stock Warning">
                              <AlertTriangle size={16} />
                            </Box>
                          )}
                          <IconButton size="small" onClick={() => handleEditClick(p.id, p.stock)}>
                            <Edit size={14} color="#6B7280" />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InventoryPage;
