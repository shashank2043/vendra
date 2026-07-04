import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (credential, { rejectWithValue }) => {
    try {
      const decoded = jwtDecode(credential);
      const { email, name, picture } = decoded;

      let role = 'CUSTOMER';
      let dbUser = null;
      let approvalStatus = 'APPROVED';

      try {
        const response = await axiosInstance.get(`/platformUsers?email=${encodeURIComponent(email)}`);
        if (response.data && response.data.length > 0) {
          dbUser = response.data[0];
          role = dbUser.role;
        } else {
          // Auto-register new users as CUSTOMER
          const newUser = {
            id: `user-${Date.now()}`,
            email,
            name,
            role: 'CUSTOMER',
            picture,
            suspended: false
          };
          const createResponse = await axiosInstance.post('/platformUsers', newUser);
          dbUser = createResponse.data;
          role = 'CUSTOMER';
        }

        if (role === 'VENDOR') {
          const profileResponse = await axiosInstance.get(`/vendorProfiles?userId=${dbUser.id}`);
          if (profileResponse.data && profileResponse.data.length > 0) {
            approvalStatus = profileResponse.data[0].approvalStatus;
          } else {
            // Auto-create a pending vendor profile
            const newProfile = {
              id: `vp-${Date.now()}`,
              userId: dbUser.id,
              businessName: `${name}'s Store`,
              approvalStatus: 'PENDING',
              createdAt: new Date().toISOString()
            };
            await axiosInstance.post('/vendorProfiles', newProfile);
            approvalStatus = 'PENDING';
          }
        }
      } catch (err) {
        console.error('Error fetching/creating user in mock db:', err);
        dbUser = { id: `user-temp-${Date.now()}`, email, name, picture, role, suspended: false };
      }

      if (dbUser.suspended) {
        return rejectWithValue('This account has been suspended by the platform administrator.');
      }

      return {
        user: { ...dbUser, name, email, picture, approvalStatus },
        token: credential,
        role,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to decode Google credentials');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  themeMode: 'light', // Persisted theme mode
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAsGuest: (state) => {
      state.user = {
        id: 'guest-customer-1',
        name: 'Guest Customer',
        email: 'guest@vendra.com',
        role: 'CUSTOMER',
        picture: '',
        approvalStatus: 'APPROVED'
      };
      state.token = 'guest-token';
      state.role = 'CUSTOMER';
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginAsDemoUser: (state, action) => {
      const demoRole = action.payload; // 'CUSTOMER' | 'VENDOR_APPROVED' | 'VENDOR_PENDING' | 'ADMIN'
      
      let userDetails = {};
      let role = 'CUSTOMER';

      if (demoRole === 'ADMIN') {
        role = 'ADMIN';
        userDetails = {
          id: 'user-admin-1',
          name: 'Platform Admin',
          email: 'admin@example.com',
          role: 'ADMIN',
          picture: '',
          approvalStatus: 'APPROVED'
        };
      } else if (demoRole === 'VENDOR_APPROVED') {
        role = 'VENDOR';
        userDetails = {
          id: 'user-vendor-1',
          name: 'Aura Home Seller',
          email: 'vendor@example.com',
          role: 'VENDOR',
          picture: '',
          approvalStatus: 'APPROVED'
        };
      } else if (demoRole === 'VENDOR_PENDING') {
        role = 'VENDOR';
        userDetails = {
          id: 'user-vendor-2',
          name: 'Pending Seller',
          email: 'pending_vendor@example.com',
          role: 'VENDOR',
          picture: '',
          approvalStatus: 'PENDING'
        };
      } else {
        role = 'CUSTOMER';
        userDetails = {
          id: 'user-customer-1',
          name: 'John Customer',
          email: 'customer@example.com',
          role: 'CUSTOMER',
          picture: '',
          approvalStatus: 'APPROVED'
        };
      }

      state.user = userDetails;
      state.token = `demo-token-${role}`;
      state.role = role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.role = user.role;
      state.token = `email-token-${user.id}`;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateApprovalStatus: (state, action) => {
      if (state.user && state.user.role === 'VENDOR') {
        state.user.approvalStatus = action.payload;
      }
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Authentication failed';
      });
  },
});

export const { loginAsGuest, loginAsDemoUser, logout, updateApprovalStatus, toggleThemeMode, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
