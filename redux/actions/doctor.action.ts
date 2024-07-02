import { RegisterDoctorValues } from "@/constants/types";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registerDoctor = createAsyncThunk(
  "doctor/registerDoctor",
  async (values: RegisterDoctorValues, { rejectWithValue }) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        return rejectWithValue("No user data found, please log in again.");
      }

      const user = JSON.parse(userData);

      const requestBody = {
        ...values,
        user: {
          userId: user.id,
        },
      };

      const response = await api.post("/doctor/create", requestBody);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
