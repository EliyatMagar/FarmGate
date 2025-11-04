// store/slices/farmSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Farm, CreateFarmData, UpdateFarmData, FarmVerification } from '../../../types/farm';
import { farmAPI } from '../../../api/farm/farmAPI';

interface FarmState {
  farms: Farm[];
  currentFarm: Farm | null;
  pendingFarms: Farm[];
  loading: boolean;
  error: string | null;
  verificationStatus: FarmVerification | null;
}

const initialState: FarmState = {
  farms: [],
  currentFarm: null,
  pendingFarms: [],
  loading: false,
  error: null,
  verificationStatus: null,
};

// Helper function to safely append form data
const appendFormData = (formData: FormData, data: Record<string, any>) => {
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'images' && value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
};

// Async thunks for farmer
export const createFarm = createAsyncThunk(
  'farm/create',
  async (farmData: CreateFarmData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append basic fields safely
      appendFormData(formData, farmData);

      // Append images
      if (farmData.images && farmData.images.length > 0) {
        farmData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await farmAPI.createFarm(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Farm creation failed');
    }
  }
);

export const getMyFarms = createAsyncThunk(
  'farm/myFarms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await farmAPI.getMyFarms();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch farms');
    }
  }
);

export const getFarmById = createAsyncThunk(
  'farm/getById',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const response = await farmAPI.getFarmById(farmId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch farm');
    }
  }
);

export const updateFarm = createAsyncThunk(
  'farm/update',
  async ({ farmId, farmData }: { farmId: string; farmData: UpdateFarmData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append basic fields safely
      appendFormData(formData, farmData);

      // Append images
      if (farmData.images && farmData.images.length > 0) {
        farmData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await farmAPI.updateFarm(farmId, formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Farm update failed');
    }
  }
);

export const getVerificationStatus = createAsyncThunk(
  'farm/verificationStatus',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const response = await farmAPI.getVerificationStatus(farmId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch verification status');
    }
  }
);

// Async thunks for admin
export const getPendingFarms = createAsyncThunk(
  'farm/pendingFarms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await farmAPI.getPendingFarms();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending farms');
    }
  }
);

export const verifyFarm = createAsyncThunk(
  'farm/verify',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const response = await farmAPI.verifyFarm(farmId);
      return { farmId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify farm');
    }
  }
);

export const rejectFarm = createAsyncThunk(
  'farm/reject',
  async ({ farmId, rejectionReason }: { farmId: string; rejectionReason: string }, { rejectWithValue }) => {
    try {
      const response = await farmAPI.rejectFarm(farmId, rejectionReason);
      return { farmId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject farm');
    }
  }
);

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFarm: (state) => {
      state.currentFarm = null;
    },
    clearFarms: (state) => {
      state.farms = [];
    },
    clearPendingFarms: (state) => {
      state.pendingFarms = [];
    },
    clearVerificationStatus: (state) => {
      state.verificationStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Farm
      .addCase(createFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFarm.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.farm) {
          state.farms.push(action.payload.farm);
        }
      })
      .addCase(createFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get My Farms
      .addCase(getMyFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload.farms || [];
      })
      .addCase(getMyFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Farm By ID
      .addCase(getFarmById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFarmById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFarm = action.payload.farm || null;
      })
      .addCase(getFarmById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentFarm = null;
      })
      // Update Farm
      .addCase(updateFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.farm) {
          const index = state.farms.findIndex(farm => farm.id === action.payload.farm.id);
          if (index !== -1) {
            state.farms[index] = action.payload.farm;
          }
          state.currentFarm = action.payload.farm;
        }
      })
      .addCase(updateFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Verification Status
      .addCase(getVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVerificationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationStatus = action.payload.verification || null;
      })
      .addCase(getVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationStatus = null;
      })
      // Get Pending Farms (Admin)
      .addCase(getPendingFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFarms = action.payload.farms || [];
      })
      .addCase(getPendingFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.pendingFarms = [];
      })
      // Verify Farm (Admin)
      .addCase(verifyFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyFarm.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFarms = state.pendingFarms.filter(farm => farm.id !== action.payload.farmId);
      })
      .addCase(verifyFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reject Farm (Admin)
      .addCase(rejectFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectFarm.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFarms = state.pendingFarms.filter(farm => farm.id !== action.payload.farmId);
      })
      .addCase(rejectFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearCurrentFarm, 
  clearFarms, 
  clearPendingFarms, 
  clearVerificationStatus 
} = farmSlice.actions;
export default farmSlice.reducer;