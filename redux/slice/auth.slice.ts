import { IUser } from "@/constants/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface AuthState {
  currentUser: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  token: null,
  loading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  "user/register",
  async (
    userData: {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/register",
        userData
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const logIn = createAsyncThunk(
  "auth/logIn",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://your-api-url/api/auth/login",
        credentials
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://your-api-url/api/auth/forgot-password",
        { email }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { email: string; code: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://your-api-url/api/auth/reset-password",
        data
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const logOut = createAsyncThunk("auth/logOut", async () => {
  // Perform logout logic here, like removing tokens, etc.
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signUpStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signUpSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signUpFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Log In
      .addCase(logIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Log Out
      .addCase(logOut.fulfilled, (state) => {
        state.currentUser = null;
      });
  },
});

// export const { logout } = authSlice.actions;
export default authSlice.reducer;
