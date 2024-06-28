import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { DoctorCardProps, RegisterDoctorValues } from "@/constants/types";

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
  reducers: {
    registerDoctorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerDoctorSuccess: (state, action) => {
      state.doctorDetails = action.payload;
      state.loading = false;
      state.error = null;
    },
    registerDoctorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDoctorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateDoctorSuccess: (state, action) => {
      state.doctorDetails = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateDoctorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  registerDoctorFailure,
  registerDoctorStart,
  registerDoctorSuccess,
  updateDoctorFailure,
  updateDoctorStart,
  updateDoctorSuccess,
} = doctorSlice.actions;

export default doctorSlice.reducer;
