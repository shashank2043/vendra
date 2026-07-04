import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const ProductFormModal = ({ open, onClose, onSave, product }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories in modal:', err));
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setPrice(product.price || '');
      setStock(product.stock || '');
      setImageUrls(product.imageUrls?.join(', ') || '');
      setTags(product.tags?.join(', ') || '');
    } else {
      setName('');
      setDescription('');
      setCategoryId('');
      setPrice('');
      setStock('');
      setImageUrls('');
      setTags('');
    }
  }, [product, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      description,
      categoryId,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrls: imageUrls.split(',').map(url => url.trim()).filter(Boolean),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    onSave(payload);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: '12px' }
      }}
    >
      <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
        {product ? 'Edit Product Details' : 'Add New Product'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Product Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth required>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price ($)"
                type="number"
                fullWidth
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Initial Stock"
                type="number"
                fullWidth
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Image URLs (comma separated)"
            fullWidth
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          />
          <TextField
            label="Tags (comma separated)"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="handmade, ceramic, organic"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            {product ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProductFormModal;
