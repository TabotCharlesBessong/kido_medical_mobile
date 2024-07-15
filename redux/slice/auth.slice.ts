import { IUser } from "@/constants/types";
import { createSlice } from "@reduxjs/toolkit";

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
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  signUpFailure,
  signUpStart,
  signUpSuccess,
  forgotPasswordFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  resetPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess
} = authSlice.actions;
export default authSlice.reducer;
