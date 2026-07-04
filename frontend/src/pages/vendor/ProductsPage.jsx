import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Skeleton } from '@mui/material';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchVendorProducts, createProduct, updateProduct, deleteProduct } from '../../features/vendor/products/productSlice';
import ProductFormModal from '../../components/ProductFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading } = useAppSelector((state) => state.vendorProducts);

  const [vendor, setVendor] = useState(null);
  const [categories, setCategories] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const vendorId = user.username;
    axiosInstance.get(`/api/v1/vendors/${vendorId}`)
      .then(res => setVendor(res.data))
      .catch(() => {});
    dispatch(fetchVendorProducts(vendorId));

    axiosInstance.get('/api/v1/categories')
      .then(res => {
        const map = {};
        res.data.forEach(c => {
          map[c.id] = c.name;
        });
        setCategories(map);
      });
  }, [dispatch, user]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleFormSave = (data) => {
    if (selectedProduct) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleCreate = (data) => {
    if (!user) return;
    dispatch(createProduct({ ...data, vendorId: user.username }))
      .unwrap()
      .then(() => {
        toast.success('Product submitted for moderation!');
        setFormOpen(false);
      })
      .catch((err) => toast.error(err || 'Failed to submit product'));
  };

  const handleUpdate = (data) => {
    if (!selectedProduct) return;
    dispatch(updateProduct({ id: selectedProduct.id, data }))
      .unwrap()
      .then(() => {
        toast.success('Product updated successfully!');
        setFormOpen(false);
        setSelectedProduct(null);
      })
      .catch((err) => toast.error(err || 'Failed to update product'));
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    dispatch(deleteProduct(deleteId))
      .unwrap()
      .then(() => {
        toast.success('Product deleted successfully.');
        setDeleteId(null);
      })
      .catch((err) => toast.error(err || 'Failed to delete product'));
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Skeleton width="180px" height="40px" />
          <Skeleton width="120px" height="40px" />
        </Box>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your store's listings and track their moderation status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={handleAddClick}
          sx={{ borderRadius: '24px', px: 3 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Catalog Table */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Start selling on Vendra by onboarding your first handcrafted product."
          actionText="Add Product"
          onActionClick={handleAddClick}
        />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                <TableCell width={80}><Typography variant="body2" fontWeight={750}>Image</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Name</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Category</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Price</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Stock</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={750}>Moderation</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={750}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
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
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 220 }}>
                      {p.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{categories[p.categoryId] || 'Handcrafted'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>${p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant={p.moderationStatus || 'PENDING'}>
                      {p.moderationStatus || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditClick(p)} sx={{ mr: 0.5 }}>
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(p.id)} color="error">
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Shared Dialog Form */}
      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        product={selectedProduct}
      />

      {/* Destruction confirmation dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default ProductsPage;
