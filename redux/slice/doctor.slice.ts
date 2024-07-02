// doctorSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DoctorCardProps, RegisterDoctorValues } from "@/constants/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";

interface DoctorState {
  doctors: DoctorCardProps[];
  doctorDetails: DoctorCardProps | null;
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  doctorDetails: null,
  loading: false,
  error: null,
};

export const registerDoctor = createAsyncThunk(
  "doctor/registerDoctor",
  async (doctorData: RegisterDoctorValues, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData: any = await AsyncStorage.getItem("userData");
      if (!token || !userData) {
        throw new Error("No token or user data found, please log in again.");
      }

      const user = JSON.parse(userData);

      const requestBody = {
        ...doctorData,
        user: {
          userId: user.id,
        },
      };

      const response = await api.post("/doctor/create", requestBody);

      if (response.data.success === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerDoctor.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.doctorDetails = action.payload.doctor;
        }
      )
      .addCase(registerDoctor.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      });
  },
});

export default doctorSlice.reducer;
