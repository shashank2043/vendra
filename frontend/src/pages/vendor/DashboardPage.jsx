import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Stack } from '@mui/material';
import { DollarSign, ClipboardList, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '../../app/hooks';
import { formatMoney, selectCurrency } from '../../features/currency/currencySlice';
import axiosInstance from '../../api/axiosInstance';
import Badge from '../../components/common/Badge';

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const currency = useAppSelector(selectCurrency);
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    lowStockAlerts: 0,
    trustScore: 100
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Resolve vendor profile (the username is the cross-service vendorId)
    const vendorId = user.username;
    axiosInstance.get(`/api/v1/vendors/${vendorId}`)
      .then((vendorRes) => {
        setVendor(vendorRes.data);
        // Fetch dependencies in parallel
        return Promise.all([
          axiosInstance.get(`/api/v1/orders?vendorId=${vendorId}`),
          axiosInstance.get(`/api/v1/products?vendorId=${vendorId}`),
          axiosInstance.get(`/api/v1/trust-scores?vendorId=${vendorId}`),
          axiosInstance.get(`/api/v1/analytics?vendorId=${vendorId}`)
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [ordersRes, productsRes, trustRes, analyticsRes] = results;

        const orders = ordersRes.data;
        const products = productsRes.data;
        
        // Calculate dynamic dashboard stats
        const totalSales = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.total, 0);

        const pendingOrders = orders
          .filter(o => o.status === 'PLACED' || o.status === 'CONFIRMED')
          .length;

        const lowStockAlerts = products
          .filter(p => p.stock < 5)
          .length;

        const trustData = Array.isArray(trustRes.data) ? trustRes.data[0] : trustRes.data;
        const trustScore = trustData?.trustScore ?? 100;

        const analyticsData = Array.isArray(analyticsRes.data) ? analyticsRes.data[0] : analyticsRes.data;

        setStats({ totalSales, pendingOrders, lowStockAlerts, trustScore });
        // Take last 5 orders sorted newest first
        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        setSalesData(analyticsData?.salesOverTime || []);
      })
      .catch((err) => console.error('Error loading dashboard data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const statItems = [
    { title: 'Total Revenue', value: formatMoney(stats.totalSales, currency), icon: DollarSign, color: '#0F766E', bg: 'rgba(15, 118, 110, 0.08)' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: ClipboardList, color: '#D97706', bg: 'rgba(217, 119, 6, 0.08)' },
    { title: 'Low Stock Alerts', value: stats.lowStockAlerts, icon: AlertTriangle, color: '#BE123C', bg: 'rgba(190, 18, 60, 0.08)' },
    { title: 'Trust Score', value: `${stats.trustScore}%`, icon: ShieldCheck, color: '#C2A26F', bg: 'rgba(194, 162, 111, 0.08)' }
  ];

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from(new Array(4)).map((_, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Welcome back, {user?.name || 'Artisan Partner'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview metrics for {vendor?.businessName || 'Vendra Store'}.
        </Typography>
      </Box>

      {/* Stats Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statItems.map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {item.value}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: item.bg, color: item.color, p: 1.5, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Recharts sales line chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 3 }}>
                Sales Performance (Last 7 Days)
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                {salesData.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary" variant="body2">No sales chart data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                      <Line type="monotone" dataKey="sales" stroke="#C2A26F" strokeWidth={3} dot={{ r: 4, fill: '#111827' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts Summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 2 }}>
                Console Action Points
              </Typography>
              <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AlertTriangle size={24} color="#BE123C" />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Inventory Stock Check</Typography>
                    <Typography variant="caption" color="text.secondary">You have {stats.lowStockAlerts} items running low on warehouse inventory.</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShieldCheck size={24} color="#0F766E" />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Trust Metric Positive</Typography>
                    <Typography variant="caption" color="text.secondary">Your trust gauge stands at {stats.trustScore}%. Maintain prompt order dispatch.</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders table */}
      <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="subtitle1" fontWeight={750}>
              Recent Incoming Orders
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FBFBFA' }}>
                  <TableCell><Typography variant="body2" fontWeight={700}>Order Reference</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>Date</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>Customer</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>Status</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={700}>Total</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">No incoming orders recorded yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>#{String(order.id).slice(0, 14)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell><Badge variant={order.status}>{order.status}</Badge></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>${order.total}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
