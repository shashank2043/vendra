import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, ButtonGroup, CircularProgress, Skeleton } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchReportsSummary } from '../../features/admin/reports/reportSlice';

const ReportsPage = () => {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((state) => state.adminReports);

  const [dateRange, setDateRange] = useState('All');

  useEffect(() => {
    dispatch(fetchReportsSummary());
  }, [dispatch]);

  if (loading || !summary) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Skeleton width="180px" height="40px" />
          <Skeleton width="150px" height="40px" />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
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

  const getFilteredRevenue = () => {
    const list = summary.revenueTrend;
    if (dateRange === '7D') return list.slice(-7);
    if (dateRange === '30D') return list.slice(-30);
    return list;
  };

  const filteredRevenue = getFilteredRevenue();

  // Simulated dispute claim trends for display
  const complaintTrendData = [
    { date: '06/28', claims: 0 },
    { date: '06/29', claims: 0 },
    { date: '06/30', claims: 1 },
    { date: '07/01', claims: 0 },
    { date: '07/02', claims: 0 },
    { date: '07/03', claims: 0 },
    { date: '07/04', claims: 0 }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title & Ranges */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Reports & Business Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform transaction logs, average fulfillment SLAs, and active customer dispute metrics.
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

      {/* KPI stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Platform SLA Compliance', value: `${summary.slaCompliance}%`, desc: 'Average fulfillment trust score across all approved shops.' },
          { title: 'Commission Receipts (15%)', value: `$${filteredRevenue.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}`, desc: 'Aggregated revenue cut from delivered purchases.' },
          { title: 'Platform Claims Filed', value: summary.disputesCount, desc: 'Total volume of customer disputes currently registered.' }
        ].map((card, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4}>
        
        {/* Platform Revenue Trend */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Platform Commission Receipts ($)
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                {filteredRevenue.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary" variant="body2">No transactions recorded for this period.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Shops sales */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Performing Shops ($ Gross Sales)
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                {summary.topVendors.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary" variant="body2">No merchant sales recorded.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.topVendors} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#0F172A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dispute Claims Trends */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Customer Dispute Filing Trends
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complaintTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} precision={0} />
                    <Tooltip />
                    <Line type="monotone" dataKey="claims" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SLA Compliance Gauge Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', py: 4 }}>
              <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start' }}>
                Platform SLA Compliance Ratio
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={6}
                  sx={{ color: '#F3F4F6' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={summary.slaCompliance}
                  size={120}
                  thickness={6}
                  sx={{
                    color: '#10B981',
                    position: 'absolute',
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="primary.main">
                    {summary.slaCompliance}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    COMPLIANT
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ maxWidth: 280, mt: 1 }}>
                Measures aggregate dispatch timelines and low dispute feedback scores across all approved sellers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ReportsPage;
