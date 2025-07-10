import { AuthApiResponse, AuthState, ForgotPasswordApiResponse, ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordApiResponse, ResetPasswordPayload, VerifyPayload } from "@/constants/types/auth";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@stream-io/video-react-native-sdk";
import * as SecureStore from "expo-secure-store";
// Adjust path if needed

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk<
  AuthApiResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<AuthApiResponse>(
      "/user/login",
      credentials
    );
    const data = response.data;

    if (data.success && data.data) {
      // Securely store the token and user data
      await SecureStore.setItemAsync("userToken", data.data.token);
      await SecureStore.setItemAsync(
        "userData",
        JSON.stringify(data.data.user)
      );
      return data;
    } else {
      return rejectWithValue(data.message || "Login failed.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for User Registration
export const registerUser = createAsyncThunk<
  AuthApiResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<AuthApiResponse>(
      "/user/register",
      userData
    );
    const data = response.data;

    if (data.success) {
      return data; // Registration usually doesn't return a token, just a success status
    } else {
      return rejectWithValue(data.message || "Registration failed.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for User Verification
export const verifyAccount = createAsyncThunk<
  AuthApiResponse,
  VerifyPayload,
  { rejectValue: string }
>("auth/verifyAccount", async (verificationData, { rejectWithValue }) => {
  try {
    // Corrected endpoint based on Postman collection: /user/verify-account
    const response = await axiosInstance.post<AuthApiResponse>(
      "/user/verify-account",
      verificationData
    );
    const data = response.data;

    if (data.success) {
      return data;
    } else {
      return rejectWithValue(data.message || "Account verification failed.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to load user data from SecureStore on app launch
export const loadUserFromStorage = createAsyncThunk<
  AuthState,
  void,
  { rejectValue: string }
  // @ts-ignore
>("auth/loadUserFromStorage", async ( { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    const userDataString = await SecureStore.getItemAsync("userData");

    if (token && userDataString) {
      const user: User = JSON.parse(userDataString);
      return { user, token, isLoading: false, error: null };
    } else {
      return rejectWithValue("No user data found in storage.");
    }
  } catch (error: any) {
    // In case of parsing error or other storage issues
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");
    return rejectWithValue(
      error.message || "Failed to load user from storage."
    );
  }
});

// Async Thunk for Forgot Password (Request Code)
export const forgotPassword = createAsyncThunk<ForgotPasswordApiResponse, ForgotPasswordPayload, { rejectValue: string }>(
  'auth/forgotPassword',
  async (emailPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ForgotPasswordApiResponse>('/user/forgot-password', emailPayload);
      const data = response.data;

      if (data.success) {
        // You might want to save the 'code' temporarily if needed for auto-filling the next screen
        // However, usually, this code is sent to the user's email, not directly returned to the frontend.
        // If your backend *does* return it for testing/dev purposes, you could save it.
        // For production, the user would check their email.
        if (data.data?.token?.code) {
          await SecureStore.setItemAsync('resetCode', data.data.token.code); // For development/testing
        }
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to request password reset.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Reset Password
export const resetPassword = createAsyncThunk<ResetPasswordApiResponse, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      // Remove confirmPassword as it's only for frontend validation
      const { confirmPassword, ...dataToSend } = resetData;
      const response = await axiosInstance.post<ResetPasswordApiResponse>('/user/reset-password', dataToSend);
      const data = response.data;

      if (data.success) {
        await SecureStore.deleteItemAsync('resetCode'); // Clear the temporary code after successful reset
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reducer to clear authentication state (for logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      SecureStore.deleteItemAsync("userToken"); // Clear from storage
      SecureStore.deleteItemAsync("userData"); // Clear from storage
    },
    // Reducer to clear specific authentication errors, useful for forms
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Thunk handling
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || "Login failed.";
      })
      // Register Thunk handling
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // After successful registration, user is not automatically logged in.
        // They need to verify their account first.
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed.";
      })
      // Verify Account Thunk handling
      .addCase(verifyAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Account verification failed.";
      })
      // Load User From Storage Thunk handling
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || "Failed to load session.";
      })
      // Forgot Password Thunk handling
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null; // Successfully requested reset code
        // The code itself is usually not kept in Redux state, as it's for one-time use via email.
        // If you saved it to SecureStore, it's independent of Redux state here.
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to request password reset.';
      })
      // Reset Password Thunk handling
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null; // Successfully reset password
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reset password.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions; // Export individual actions
export default authSlice.reducer; // Export the reducer as default
