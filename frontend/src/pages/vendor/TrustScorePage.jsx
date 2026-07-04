import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Skeleton } from '@mui/material';
import { ArrowUp, ArrowDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTrustScore } from '../../features/vendor/trustScore/trustScoreSlice';
import axiosInstance from '../../api/axiosInstance';

const TrustScorePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { scoreData, loading } = useAppSelector((state) => state.vendorTrustScore);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!user) return;
    const vendorId = user.id;
    axiosInstance.get(`/api/v1/vendors/${vendorId}`)
      .then(res => setVendor(res.data))
      .catch(() => {});
    dispatch(fetchTrustScore(vendorId));
  }, [dispatch, user]);

  if (loading || !scoreData) {
    return (
      <Box>
        <Skeleton variant="text" width="200px" height="40px" sx={{ mb: 2 }} />
        <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 4 }} />
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#0F766E';
    if (score >= 70) return '#D97706';
    return '#BE123C';
  };

  const scoreColor = getScoreColor(scoreData.score);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Seller Trust Score
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyze fulfillment performance, dispatch delivery logs, and dispute compliance grades.
        </Typography>
      </Box>

      {/* Circular Gauge Card */}
      <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', mb: 5, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={160}
            thickness={5}
            sx={{ color: '#F3F4F6' }}
          />
          <CircularProgress
            variant="determinate"
            value={scoreData.score}
            size={160}
            thickness={5}
            sx={{
              color: scoreColor,
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
            <Typography variant="h3" component="div" fontWeight={900} color="primary.main" sx={{ letterSpacing: '-0.04em' }}>
              {scoreData.score}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              TRUST LEVEL
            </Typography>
          </Box>
        </Box>
        <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 1 }}>
          {scoreData.score >= 90 ? 'Excellent Standing' : scoreData.score >= 70 ? 'Fair Standing' : 'Critical Standing'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
          Your Trust Score represents customer fulfillment efficiency, dispatch latency, and low cancellation ratios. Keep it above 90 to qualify for "Preferred Seller" benefits.
        </Typography>
      </Card>

      {/* Metric Cards */}
      <Grid container spacing={3}>
        {/* Metric 1: Fulfillment */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <CheckCircle2 size={24} color="#0F766E" />
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#0F766E', gap: 0.5 }}>
                  <ArrowUp size={16} />
                  <Typography variant="caption" fontWeight={700}>0.4%</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Fulfillment Rate
              </Typography>
              <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ mb: 1 }}>
                {scoreData.fulfillmentRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Percentage of accepted orders fulfilled without cancellations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2: Avg Delay */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Clock size={24} color="#C2A26F" />
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#0F766E', gap: 0.5 }}>
                  <ArrowDown size={16} />
                  <Typography variant="caption" fontWeight={700}>0.2d</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Avg Dispatch Latency
              </Typography>
              <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ mb: 1 }}>
                {scoreData.avgDeliveryDelay} Days
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Average elapsed time before order packages are shipped.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3: Complaint Ratio */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <AlertCircle size={24} color="#BE123C" />
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#BE123C', gap: 0.5 }}>
                  <ArrowUp size={16} />
                  <Typography variant="caption" fontWeight={700}>0.1%</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={650} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Complaint Ratio
              </Typography>
              <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ mb: 1 }}>
                {scoreData.complaintRatio}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Ratio of customer complaints or refund requests filed.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrustScorePage;
