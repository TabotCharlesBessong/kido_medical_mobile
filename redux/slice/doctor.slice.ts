// doctorSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DoctorCardProps, RegisterDoctorValues } from "@/constants/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";
import { fetchDoctor, fetchDoctors, registerDoctor, updateDoctor } from "../actions/doctor.action";

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
      })
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.doctorDetails = action.payload.doctor;
      })
      .addCase(updateDoctor.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      .addCase(fetchDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctor.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.doctorDetails = action.payload.doctor;
      })
      .addCase(fetchDoctor.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.doctors = action.payload.doctors;
      })
      .addCase(fetchDoctors.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });
  },
});

export default doctorSlice.reducer;
