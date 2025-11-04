// src/store/slices/payment/paymentSlice.ts
import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { paymentAPI } from "../../../api/payment/paymentAPI";
import type {
  Payment,
  PaymentRequestData,
  VerifyPaymentData,
  CODConfirmData,
} from "../../../types/payment";

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
  statistics: any | null;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  statistics: null,
};

// ---- Async Thunks ----
export const createPayment = createAsyncThunk(
  "payments/create",
  async (data: PaymentRequestData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPayment(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payments/verify",
  async (data: VerifyPaymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPayment(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmCODPayment = createAsyncThunk(
  "payments/confirmCOD",
  async (data: CODConfirmData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.confirmCODPayment(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentStatistics = createAsyncThunk(
  "payments/statistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----
const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
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
        state.currentPayment = action.payload.payment;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Verify Payment
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload.payment;
      })

      // Confirm COD Payment
      .addCase(confirmCODPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload.payment;
      })

      // Payment Stats
      .addCase(fetchPaymentStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.statistics;
      });
  },
});

export const { clearPaymentError, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
