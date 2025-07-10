// redux/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (payload: any, thunkAPI) => {
    try {
      const response = await authService.register(payload);
      return response;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const verifyUser = createAsyncThunk(
  "auth/verify",
  async (otp: string, thunkAPI) => {
    try {
      const response = await authService.verify(otp);
      return response;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: any, thunkAPI) => {
    try {
      const response = await authService.login(payload);
      await AsyncStorage.setItem("userToken", response.token);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      return response;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("userData");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
