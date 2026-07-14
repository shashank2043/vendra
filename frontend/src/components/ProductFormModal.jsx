import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, FormControl, InputLabel, Select, MenuItem, Grid, Typography, IconButton } from '@mui/material';
import { UploadCloud, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAppSelector } from '../app/hooks';
import { selectCurrency, convert, toBaseCurrency } from '../features/currency/currencySlice';
import { toast } from 'react-toastify';

// Downscale an uploaded image and return a JPEG data URI, keeping payloads small
// enough to store inline (no external file host in this stack).
const fileToDataUrl = (file, maxDim = 800) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProductFormModal = ({ open, onClose, onSave, product }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);   // gallery of image values (data URIs and/or URLs)
  const [urlInput, setUrlInput] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const currency = useAppSelector(selectCurrency);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      toast.error('Please choose image files.');
      return;
    }
    setUploading(true);
    try {
      const dataUrls = await Promise.all(files.map((f) => fileToDataUrl(f)));
      setImages((prev) => [...prev, ...dataUrls]);
      toast.success(`${dataUrls.length} image(s) added.`);
    } catch {
      toast.error('Could not read one of the images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    // Always accept the link — the server fetches and embeds remote images on save, so
    // they display even when the browser can't preview them (hotlink/CORS/proxy).
    setImages((prev) => [...prev, u]);
    setUrlInput('');
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    axiosInstance.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories in modal:', err));
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setCategory(product.category || '');
      // Stored prices are USD base; show them in the vendor's currency for editing.
      setPrice(product.price != null ? convert(product.price, currency).toFixed(2) : '');
      setStock(product.stock || '');
      setImages(product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []));
      setUrlInput('');
      setTags(product.attributes?.tags?.join(', ') || '');
    } else {
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setStock('');
      setImages([]);
      setUrlInput('');
      setTags('');
    }
  }, [product, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !category || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    // Full gallery, kept as-is (URLs or data URIs — never split on commas).
    const gallery = [...images, urlInput.trim()].map((s) => (s || '').trim()).filter(Boolean);
    const payload = {
      name,
      description,
      category, // backend expects `category` (non-blank), stores the category name
      // The vendor enters the price in their selected currency; store it in the USD base.
      price: Number(toBaseCurrency(parseFloat(price), currency).toFixed(2)),
      stock: parseInt(stock),
      imageUrl: gallery[0] || '', // primary thumbnail for lists/cart
      imageUrls: gallery,
      attributes: tagList.length ? { tags: tagList } : undefined,
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Price (${currency})`}
                type="number"
                fullWidth
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={`Enter the price in ${currency}; stored and shown to buyers in their own currency.`}
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
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileUpload}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<UploadCloud size={18} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{ borderRadius: '8px' }}
              >
                {uploading ? 'Processing...' : 'Upload Images'}
              </Button>
              <Typography variant="caption" color="text.secondary">
                {images.length ? `${images.length} image(s) added` : 'No images yet'}
              </Typography>
            </Box>

            {images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {images.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={img}
                      alt={`image ${i + 1}`}
                      sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #E5E7EB' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(i)}
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', border: '1px solid #E5E7EB', p: 0.25, '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
                    >
                      <X size={12} />
                    </IconButton>
                    {i === 0 && (
                      <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.6rem', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                        Primary
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Add an image URL"
                fullWidth
                size="small"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
              />
              <Button variant="outlined" onClick={addUrl} sx={{ borderRadius: '8px', whiteSpace: 'nowrap' }}>Add</Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              Add multiple images by uploading files or pasting links. Pasted links are fetched and embedded on save, so they display even if the preview here appears blank. If a link can't be fetched at all, upload the file instead.
            </Typography>
          </Box>
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
