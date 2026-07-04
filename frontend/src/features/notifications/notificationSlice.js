import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ role, userId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (userId) params.append('userId', userId);
      const query = params.toString();
      const response = await axiosInstance.get(`/notifications${query ? `?${query}` : ''}`);

      // Keep a client-side guard in case the endpoint returns role-wide notifications.
      const list = Array.isArray(response.data) ? response.data : [];
      const data = list.filter(n => !n.userId || n.userId === userId);

      // Sort notifications by date/id descending (newest first)
      return data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}`, { read: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (notifications, { dispatch, rejectWithValue }) => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(n => dispatch(markAsRead(n.id)));
      await Promise.all(promises);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addLocalNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index].read = true;
        }
      });
  },
});

export const { addLocalNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
