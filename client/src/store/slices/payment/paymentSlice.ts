// store/slices/payment/paymentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  Payment, 
  PaymentRequestData, 
  CODConfirmData,
} from '../../../types/payment';
import { paymentAPI } from '../../../api/payment/paymentAPI';

interface PaymentState {
  currentPayment: Payment | null;
  userPayments: Payment[];
  loading: boolean;
  error: string | null;
  paymentMethods: Array<{ name: string; type: string; gateways?: string[] }>;
  statistics: any | null;
  userPaymentsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: PaymentState = {
  currentPayment: null,
  userPayments: [],
  loading: false,
  error: null,
  paymentMethods: [],
  statistics: null,
  userPaymentsPagination: null,
};

// Async thunks
export const createPayment = createAsyncThunk(
  'payments/create',
  async (paymentData: PaymentRequestData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPayment(paymentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Payment creation failed');
    }
  }
);

export const confirmStripePayment = createAsyncThunk(
  'payments/confirmStripe',
  async (paymentIntentId: string, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.confirmStripePayment(paymentIntentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Stripe payment confirmation failed');
    }
  }
);

export const createCODPayment = createAsyncThunk(
  'payments/createCOD',
  async (codData: Omit<PaymentRequestData, 'payment_method' | 'payment_gateway'>, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createCODPayment(codData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'COD payment creation failed');
    }
  }
);

export const confirmCODPayment = createAsyncThunk(
  'payments/confirmCOD',
  async (codData: CODConfirmData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.confirmCODPayment(codData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'COD confirmation failed');
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'payments/getDetails',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentDetails(orderId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payment details');
    }
  }
);

export const getUserPayments = createAsyncThunk(
  'payments/getUserPayments',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getUserPayments(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user payments');
    }
  }
);

export const initiateRefund = createAsyncThunk(
  'payments/initiateRefund',
  async ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.initiateRefund(paymentId, amount, reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Refund initiation failed');
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  'payments/getMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentMethods();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payment methods');
    }
  }
);

export const getPaymentStatistics = createAsyncThunk(
  'payments/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payment statistics');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearUserPayments: (state) => {
      state.userPayments = [];
      state.userPaymentsPagination = null;
    },
    setPaymentMethods: (state, action: PayloadAction<Array<{ name: string; type: string; gateways?: string[] }>>) => {
      state.paymentMethods = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Extract payment from the nested data structure
        state.currentPayment = action.payload.data.payment;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm Stripe Payment
      .addCase(confirmStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: For confirmStripePayment, the payment is in data property directly
        state.currentPayment = action.payload.data;
      })
      .addCase(confirmStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create COD Payment
      .addCase(createCODPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCODPayment.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: For createCODPayment, the payment is in data property directly
        state.currentPayment = action.payload.data;
      })
      .addCase(createCODPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm COD Payment
      .addCase(confirmCODPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmCODPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmCODPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Payment Details
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: For getPaymentDetails, the payment is in data property directly
        state.currentPayment = action.payload.data;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get User Payments
      .addCase(getUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.userPayments = action.payload.data;
        state.userPaymentsPagination = action.payload.pagination;
      })
      .addCase(getUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Initiate Refund
      .addCase(initiateRefund.fulfilled, (state, action) => {
        // FIX: Update the current payment with refund details
        if (state.currentPayment && state.currentPayment.id === action.payload.data.payment?.id) {
          state.currentPayment = action.payload.data.payment;
        }
      })
      .addCase(initiateRefund.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Get Payment Methods
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload.methods;
      })
      // Get Payment Statistics
      .addCase(getPaymentStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      });
  },
});

export const {
  clearError,
  clearCurrentPayment,
  clearUserPayments,
  setPaymentMethods,
} = paymentSlice.actions;

export default paymentSlice.reducer;