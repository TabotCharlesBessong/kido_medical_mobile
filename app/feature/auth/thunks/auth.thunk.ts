import { createAsyncThunk } from "@reduxjs/toolkit";

import { AuthService } from "../../../../services/api/auth.service";
import { getExceptionPayload } from "../../../../utils/get-exception-payload";
import { ApiRequestErrorType } from "../../../../types/api.types";
import { LoginRequestType } from "@/types/login.type";

const authService = new AuthService();

export const loginUserThunk = createAsyncThunk(
  "/user/login",
  async (data: LoginRequestType, { rejectWithValue }) => {
    try {
      console.log(data, "saduasud saidkhsakd");

      const response = await authService.loginUser(data);
      console.log(response?.data, "asd sada asdsa");

      return response?.data;
    } catch (ex) {
      return rejectWithValue(getExceptionPayload(ex) as ApiRequestErrorType);
    }
  }
);
