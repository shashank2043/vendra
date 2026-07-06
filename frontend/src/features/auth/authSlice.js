import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';

// Map the Keycloak realm roles to a single primary app role.
const ROLE_PRECEDENCE = ['ADMIN', 'VENDOR', 'CUSTOMER'];

const derivePrimaryRole = (realmRoles = []) => {
  const normalized = realmRoles
    .map((r) => String(r).replace(/^ROLE_/, '').toUpperCase())
    .filter((r) => ROLE_PRECEDENCE.includes(r));
  for (const role of ROLE_PRECEDENCE) {
    if (normalized.includes(role)) return role;
  }
  return 'CUSTOMER';
};

const decodeToken = (accessToken) => {
  try {
    return jwtDecode(accessToken);
  } catch {
    return {};
  }
};

// Best-effort profile enrichment. Never throws — falls back to JWT claims.
// The access token is passed explicitly because it isn't persisted yet at login time.
const enrichProfile = async (decoded, role, accessToken) => {
  const jwtId = decoded.sub || decoded.preferred_username;
  const fallback = {
    id: jwtId,
    username: decoded.preferred_username || decoded.sub,
    email: decoded.email,
    approvalStatus: role === 'VENDOR' ? 'PENDING' : 'APPROVED',
  };

  const endpoints = ['/auth/profile', '/api/v1/users/profile'];
  const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  for (const url of endpoints) {
    try {
      const res = await axiosInstance.get(url, { headers: authHeader });
      const profile = res.data;
      if (profile && typeof profile === 'object') {
        return {
          ...fallback,
          ...profile,
          id: profile.id || fallback.id,
          approvalStatus:
            role === 'VENDOR'
              ? profile.approvalStatus || 'PENDING'
              : profile.approvalStatus || 'APPROVED',
        };
      }
    } catch {
      // try next endpoint / fall through to fallback
    }
  }
  return fallback;
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      const { accessToken, refreshToken, user: apiUser } = response.data;

      const decoded = decodeToken(accessToken);
      const realmRoles = decoded?.realm_access?.roles || [];
      const role = derivePrimaryRole(realmRoles.length ? realmRoles : apiUser?.roles || []);

      const enriched = await enrichProfile(decoded, role, accessToken);

      const user = {
        ...(apiUser || {}),
        ...enriched,
        id: enriched.id || apiUser?.id || decoded.sub,
        username: apiUser?.username || enriched.username,
        email: apiUser?.email || enriched.email,
        role,
      };

      return { accessToken, refreshToken, user, role };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register/customer', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const registerVendor = createAsyncThunk(
  'auth/registerVendor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register/vendor', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const refresh = createAsyncThunk(
  'auth/refresh',
  async (refreshToken, { getState, rejectWithValue }) => {
    try {
      const token = refreshToken || getState().auth.refreshToken;
      const response = await axiosInstance.post('/auth/refresh', { refreshToken: token });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Session refresh failed'
      );
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateApprovalStatus: (state, action) => {
      if (state.user && state.role === 'VENDOR') {
        state.user.approvalStatus = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(registerVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerVendor.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(refresh.fulfilled, (state, action) => {
        if (action.payload?.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload?.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      });
  },
});

export const { logout, updateApprovalStatus } = authSlice.actions;
export default authSlice.reducer;
