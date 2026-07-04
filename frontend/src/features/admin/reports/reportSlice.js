import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchReportsSummary = createAsyncThunk(
  'adminReports/fetchReportsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const [ordersRes, vendorsRes, trustRes, disputesRes] = await Promise.all([
        axiosInstance.get('/orders'),
        axiosInstance.get('/vendorProfiles'),
        axiosInstance.get('/trustScores'),
        axiosInstance.get('/disputes')
      ]);

      const orders = ordersRes.data;
      const vendors = vendorsRes.data;
      const trust = trustRes.data;
      const disputes = disputesRes.data;

      // 1. Platform Revenue Trend (15% commission on delivered orders)
      const revenueMap = {};
      orders.filter(o => o.status === 'DELIVERED').forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        const comm = order.total * 0.15;
        revenueMap[date] = (revenueMap[date] || 0) + comm;
      });
      const revenueTrend = Object.keys(revenueMap).map(date => ({
        date,
        revenue: parseFloat(revenueMap[date].toFixed(2))
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      // 2. Top Vendors by sales volume
      const vendorSales = {};
      orders.filter(o => o.status === 'DELIVERED').forEach(order => {
        vendorSales[order.vendorId] = (vendorSales[order.vendorId] || 0) + order.total;
      });
      const topVendors = Object.keys(vendorSales).map(vid => {
        const profile = vendors.find(v => v.id === vid);
        return {
          name: profile ? profile.businessName : 'Artisan Vendor',
          sales: parseFloat(vendorSales[vid].toFixed(2))
        };
      }).sort((a, b) => b.sales - a.sales).slice(0, 5);

      // 3. SLA compliance: average fulfillment score
      const totalScore = trust.reduce((sum, t) => sum + t.score, 0);
      const slaCompliance = trust.length > 0 ? parseFloat((totalScore / trust.length).toFixed(1)) : 100;

      // 4. Disputes count
      const disputesCount = disputes.length;

      return {
        revenueTrend,
        topVendors,
        slaCompliance,
        disputesCount
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reports summary');
    }
  }
);

const initialState = {
  summary: null,
  loading: false,
  error: null,
};

const adminReportSlice = createSlice({
  name: 'adminReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchReportsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load reports';
      });
  },
});

export default adminReportSlice.reducer;
