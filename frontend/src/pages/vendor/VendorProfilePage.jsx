import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Avatar, Grid, Stack, Divider } from '@mui/material';
import { Store, Phone, MapPin, UploadCloud, FileText } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Spinner from '../../components/common/Spinner';

const VendorProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [vendor, setVendor] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [warehouseAddress, setWarehouseAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get(`/api/v1/vendors/${user.id}`)
      .then(res => {
        const v = res.data;
        if (v) {
          setVendor(v);
          setBusinessName(v.businessName || '');
          setContactPhone(v.contactPhone || '');
          setWarehouseAddress(v.warehouseAddress || '');
          setLogoUrl(v.logoUrl || '');
          setDescription(v.description || '');
        }
      })
      .catch(err => console.error('Error fetching vendor profile:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!vendor) return;

    setSaving(true);
    const updatedProfile = {
      businessName,
      contactPhone,
      warehouseAddress,
      logoUrl,
      description
    };

    axiosInstance.put(`/api/v1/vendors/${vendor.id}`, updatedProfile)
      .then(() => {
        toast.success('Shop profile updated successfully!');
      })
      .catch((err) => {
        toast.error('Failed to update shop profile.');
        console.error(err);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <Spinner message="Loading profile credentials..." height="300px" />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Shop Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update business credentials, warehousing shipping coordinates, and brand display details.
        </Typography>
      </Box>

      {user?.approvalStatus !== 'APPROVED' && (
        <Box 
          sx={{ 
            mb: 4, 
            p: 2.5, 
            borderRadius: 3, 
            backgroundColor: 'rgba(217, 119, 6, 0.06)', 
            border: '1.5px solid rgba(217, 119, 6, 0.15)', 
            color: '#D97706' 
          }}
        >
          <Typography variant="body2" fontWeight={750} sx={{ mb: 0.5 }}>
            Account Pending Verification Review
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.5 }}>
            Your shop registration details are currently pending review. Please fill out your warehouse logistics address and phone details below so our team can approve your seller account.
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Left Side: Photo/Logo Upload Placeholder */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', textAlign: 'center', p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Avatar
              src={logoUrl}
              alt={businessName}
              sx={{ width: 100, height: 100, mb: 3, bgcolor: 'secondary.main', border: '2px solid', borderColor: 'divider' }}
            >
              {businessName.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight={750} sx={{ mb: 1 }}>
              Shop Brand Logo
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 3, maxWidth: 220 }}>
              Recommend 500x500px square format for optimal dashboard rendering.
            </Typography>
            
            {/* Mock Drag & Drop Box */}
            <Box
              sx={{
                width: '100%',
                py: 4,
                px: 2,
                borderRadius: 2,
                border: '1.5px dashed #cccccc',
                bgcolor: '#FBFBFA',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.01)', borderColor: 'primary.main' }
              }}
            >
              <UploadCloud size={28} color="#9CA3AF" style={{ marginBottom: '8px' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Upload Logo Image
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Right Side: Form details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Business Details Section */}
                <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Business Profile
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Store / Business Name"
                      fullWidth
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      InputProps={{
                        startAdornment: <Store size={18} color="#6B7280" style={{ marginRight: '8px' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Phone"
                      fullWidth
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      InputProps={{
                        startAdornment: <Phone size={18} color="#6B7280" style={{ marginRight: '8px' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Logo Image URL"
                      fullWidth
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Store Description"
                      fullWidth
                      multiline
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      InputProps={{
                        startAdornment: <FileText size={18} color="#6B7280" style={{ marginRight: '8px', marginTop: '4px' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                {/* Warehouse shipping origin Coordinates Section */}
                <Typography variant="subtitle2" fontWeight={750} color="secondary.dark" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Warehousing Logistics
                </Typography>
                <TextField
                  label="Warehouse Address (Shipment Origin Coordinates)"
                  fullWidth
                  required
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  helperText="This physical address is registered as the origin coordinate point to calculate shipment weight and live carrier courier costs."
                  InputProps={{
                    startAdornment: <MapPin size={18} color="#6B7280" style={{ marginRight: '8px' }} />
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={saving}
                    sx={{ px: 4, py: 1.2, borderRadius: '8px', fontWeight: 700 }}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </Box>

              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default VendorProfilePage;
