// store/slices/adminSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { type User } from '../../../types/user';
import { adminAPI } from '../../../api/auth/adminAPI';

interface AdminState {
  pendingUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  pendingUsers: [],
  loading: false,
  error: null,
};

export const getPendingUsers = createAsyncThunk(
  'admin/pendingUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingUsers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending users');
    }
  }
);

export const verifyUser = createAsyncThunk(
  'admin/verifyUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await adminAPI.verifyUser(userId);
      return { userId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify user');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Pending Users
      .addCase(getPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload.users;
      })
      .addCase(getPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify User
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter(user => user.id !== action.payload.userId);
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;