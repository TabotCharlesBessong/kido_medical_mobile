import { createSlice } from "@reduxjs/toolkit";
import { createPatientProfile, fetchPatientProfile, updatePatientProfile } from "../actions/patient.action";
import { RootState } from "../store";

interface PatientProfileState {
  profile: PatientProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const patientProfileSlice = createSlice({
  name: "patientProfile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(createPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectPatientProfile = (state: RootState) =>
  state.patientProfile.profile;
export const selectPatientProfileLoading = (state: RootState) =>
  state.patientProfile.loading;
export const selectPatientProfileError = (state: RootState) =>
  state.patientProfile.error;

export default patientProfileSlice.reducer;