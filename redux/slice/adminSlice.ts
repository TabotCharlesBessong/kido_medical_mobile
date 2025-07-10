import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api/axiosInstance";
import {
  KycVerification,
  FetchKycVerificationsApiResponse,
  VerifyDoctorPayload,
  VerifyKycPayload,
  AdminActionApiResponse,
} from "@/constants/types/admin"; // Make sure to import correct types

interface AdminState {
  pendingKyc: KycVerification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  pendingKyc: [],
  isLoading: false,
  error: null,
};

// Async Thunk for fetching pending KYC verifications
export const fetchPendingKycVerifications = createAsyncThunk<
  FetchKycVerificationsApiResponse,
  void,
  { rejectValue: string }
>("admin/fetchPendingKyc", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<FetchKycVerificationsApiResponse>(
      "/admin/kyc-verifications/pending"
    );
    const data = response.data;

    if (data.success) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch pending KYC verifications."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for verifying a doctor's profile via email
export const verifyDoctorProfile = createAsyncThunk<
  AdminActionApiResponse,
  VerifyDoctorPayload,
  { rejectValue: string }
>(
  "admin/verifyDoctorProfile",
  async (verificationData, { rejectWithValue }) => {
    try {
      // Backend expects email as query param: /api/admin/doctor-verifications/verify?email=abc@example.com
      const response = await axiosInstance.post<AdminActionApiResponse>(
        `/admin/doctor-verifications/verify?email=${verificationData.email}`,
        { status: verificationData.status, notes: verificationData.notes }
      );
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Failed to verify doctor profile."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for general KYC verification (if different from doctor, using userId in path)
export const verifyKyc = createAsyncThunk<
  AdminActionApiResponse,
  VerifyKycPayload,
  { rejectValue: string }
>("admin/verifyKyc", async (verificationData, { rejectWithValue }) => {
  try {
    // Backend expects userId in path: /api/admin/kyc-verifications/:userId/verify
    const response = await axiosInstance.patch<AdminActionApiResponse>(
      `/admin/kyc-verifications/${verificationData.userId}/verify`,
      { status: verificationData.status, notes: verificationData.notes }
    );
    const data = response.data;

    if (data.success) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to verify KYC.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    // Action to remove a KYC request from the pending list after it's processed
    removeKycFromPending: (state, action: PayloadAction<string>) => {
      state.pendingKyc = state.pendingKyc.filter(
        (kyc:any) => kyc.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPendingKycVerifications
      .addCase(fetchPendingKycVerifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingKycVerifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingKyc = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPendingKycVerifications.rejected, (state, action) => {
        state.isLoading = false;
        state.pendingKyc = []; // Clear list on error
        state.error = action.payload || "Failed to load pending KYC requests.";
      })
      // Handle verifyDoctorProfile
      .addCase(verifyDoctorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyDoctorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The `removeKycFromPending` action will be dispatched manually from the component
      })
      .addCase(verifyDoctorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify doctor profile.";
      })
      // Handle verifyKyc (general)
      .addCase(verifyKyc.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyKyc.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The `removeKycFromPending` action will be dispatched manually from the component
      })
      .addCase(verifyKyc.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify KYC.";
      });
  },
});

export const { clearAdminError, removeKycFromPending } = adminSlice.actions;
export default adminSlice.reducer;
