import { IUser } from "@/constants/types";
import { createSlice } from "@reduxjs/toolkit";
import { ApiRequestStatus,StoredErrorResponseType } from "@/types/api.types";
import { LocalStorage } from "@/services/storage/local-storage.service";
import { UserTypes } from "@/types/login.type";
import { loginUserThunk } from "@/app/feature/auth/thunks/auth.thunk";



interface AuthState {
  currentUser: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  user: UserTypes;
  accessToken: string | null;
  status: ApiRequestStatus;
  message: string;
}

const initialState: AuthState = {
  currentUser: null,
  token: null,
  loading: false,
  error: null,

  user: {} as UserTypes,
  status: ApiRequestStatus.IDLE,
  accessToken: "",
  message: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetLoginState: (state) => {
      state.status = ApiRequestStatus.IDLE;
    },
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
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state, _action) => {
        (state.status = ApiRequestStatus.PENDING),
          (state.accessToken = ""),
          (state.user = {} as UserTypes);
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        (state.status = ApiRequestStatus.FULFILLED),
          (state.accessToken = action.payload.data.token),
          (state.user = action.payload.data.user);
        console.log(action.payload);

        LocalStorage.storeLoginData(action.payload);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.status = ApiRequestStatus.REJECTED;
        state.accessToken = "";
        state.user = {} as UserTypes;
        state.message = (action.payload as StoredErrorResponseType).message;
      });
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
  resetPasswordSuccess,
  resetLoginState
} = authSlice.actions;
export default authSlice.reducer;
