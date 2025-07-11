// src/redux/slices/patientProfileSlice.ts

import { CreatePatientProfilePayload, PatientProfile, PatientProfileApiResponse } from '@/constants/types/patient';
import axiosInstance from '@/utils/api/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';


interface PatientProfileState {
  profile: PatientProfile | null; // Stores the current patient's profile
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Async Thunk for creating/completing a patient profile
export const createPatientProfile = createAsyncThunk<PatientProfileApiResponse, CreatePatientProfilePayload, { rejectValue: string }>(
  'patient/createProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PatientProfileApiResponse>('/patient/create', profileData);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to create patient profile. Please check your data.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for fetching the current patient's profile
// This assumes an endpoint like /api/patient/me that uses the JWT token to identify the user
// If not, you'd need the patient ID (e.g., from auth.user.patientProfileId)
export const fetchPatientProfile = createAsyncThunk<PatientProfileApiResponse, string | void, { rejectValue: string }>(
  'patient/fetchProfile',
  async (patientId, { rejectWithValue, getState }) => {
    try {
      // Option 1: If backend has a /me endpoint (preferred)
      // const response = await axiosInstance.get<PatientProfileApiResponse>('/patient/me');
      
      // Option 2: If we pass the patientId (e.g., from auth.user.patientProfileId)
      const userId = (getState() as any).auth.user?.id; // Get current user ID from auth slice
      if (!userId && !patientId) {
        return rejectWithValue('User ID or Patient ID not available for fetching profile.');
      }
      const idToFetch = patientId || userId; // Use patientId if provided, else current userId (assuming patientId is same as userId or available from auth.user)

      // Postman had GET /api/patient/appointments, not a direct profile get for patient.
      // Let's assume a GET /api/patient/profile endpoint or if patientId is their userId
      // For now, I'll use /api/patient/:userId, assuming the backend can return the full patient profile if userId is used.
      // You might need to confirm your backend's actual endpoint for fetching the CURRENT patient's profile.
      const response = await axiosInstance.get<PatientProfileApiResponse>(`/patient/${idToFetch}`);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Patient profile not found.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for updating a patient profile
export interface UpdatePatientProfilePayload extends Partial<CreatePatientProfilePayload> {
  // Can be partial as not all fields need to be updated
}

export const updatePatientProfile = createAsyncThunk<PatientProfileApiResponse, UpdatePatientProfilePayload, { rejectValue: string }>(
  'patient/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const currentProfileId = (getState() as any).patientProfile.profile?.id;
      if (!currentProfileId) {
        return rejectWithValue('Patient profile ID not available for update.');
      }
      // Convert age/fee to number if present and needed
      const dataToSend = {
        ...profileData,
        age: profileData.age ? Number(profileData.age) : undefined,
      };

      const response = await axiosInstance.put<PatientProfileApiResponse>(`/patient/${currentProfileId}`, dataToSend);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to update patient profile.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);


const patientProfileSlice = createSlice({
  name: 'patientProfile',
  initialState,
  reducers: {
    clearPatientProfileError: (state) => {
      state.error = null;
    },
    setPatientProfile: (state, action: PayloadAction<PatientProfile | null>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle createPatientProfile
      .addCase(createPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null;
        state.error = null;
      })
      .addCase(createPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to create patient profile.';
      })
      // Handle fetchPatientProfile
      .addCase(fetchPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to fetch patient profile.';
      })
      // Handle updatePatientProfile
      .addCase(updatePatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null; // Update with the latest data
        state.error = null;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update patient profile.';
      });
  },
});

export const { clearPatientProfileError, setPatientProfile } = patientProfileSlice.actions;
export default patientProfileSlice.reducer;