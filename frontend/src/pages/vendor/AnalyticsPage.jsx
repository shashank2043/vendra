import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, ButtonGroup, Skeleton } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '../../app/hooks';
import axiosInstance from '../../api/axiosInstance';

const COLORS = ['#111827', '#C2A26F', '#BE123C', '#0F766E'];

const AnalyticsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7D');
  const [revenueData, setRevenueData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const vendorId = user.id;
    axiosInstance.get(`/api/v1/vendors/${vendorId}`)
      .then((vendorRes) => {
        setVendor(vendorRes.data);
        return Promise.all([
          axiosInstance.get(`/api/v1/orders?vendorId=${vendorId}`),
          axiosInstance.get(`/api/v1/analytics?vendorId=${vendorId}`)
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [ordersRes, analyticsRes] = results;

        const orders = ordersRes.data;
        const analytics = Array.isArray(analyticsRes.data) ? analyticsRes.data[0] : analyticsRes.data;

        // 1. Line Chart Data (Sales Over Time)
        setRevenueData(analytics?.salesOverTime || []);

        // 2. Bar Chart Data (Top selling items computed dynamically from orders)
        const productSales = {};
        orders.forEach(o => {
          o.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
          });
        });
        const computedProducts = Object.keys(productSales).map(name => ({
          name: name.length > 15 ? `${name.slice(0, 15)}...` : name,
          units: productSales[name]
        })).sort((a, b) => b.units - a.units).slice(0, 5);
        setTopProductsData(computedProducts);

        // 3. Pie Chart Data (Category Breakdown)
        setCategoryData(analytics?.categoryBreakdown || []);
      })
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, [user]);

  // Slices data based on fake date range selection
  const getFilteredRevenueData = () => {
    if (dateRange === '7D') return revenueData.slice(-7);
    if (dateRange === '30D') return revenueData.slice(-30);
    return revenueData;
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="200px" height="40px" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const filteredRevenue = getFilteredRevenueData();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title & Range Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Sales Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review detailed product performance, categories distributions, and earnings logs.
          </Typography>
        </Box>
        
        <ButtonGroup variant="outlined" color="primary" sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          {['7D', '30D', '90D', 'All'].map((range) => (
            <Button
              key={range}
              onClick={() => setDateRange(range)}
              variant={dateRange === range ? 'contained' : 'outlined'}
              sx={{ px: 3, fontWeight: 700 }}
            >
              {range}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Grid container for charts */}
      <Grid container spacing={4}>
        
        {/* Revenue Line Chart */}
        <Grid item xs={12}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 3 }}>
                Revenue Trends ($)
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {filteredRevenue.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No revenue timeline data available.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                      <Line type="monotone" dataKey="sales" stroke="#C2A26F" strokeWidth={3} dot={{ r: 4, fill: '#111827' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Product performance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 3 }}>
                Top Performing Products (Units Sold)
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                {topProductsData.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No units sold metrics recorded yet.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} precision={0} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="units" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 2 }}>
                Category Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryData.length === 0 ? (
                  <Typography color="text.secondary">No category distribution data available.</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} formatter={(value, entry) => <span style={{ color: '#111827', fontWeight: 600, fontSize: '0.8rem' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
