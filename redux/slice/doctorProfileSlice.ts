import { AllDoctorsApiResponse, CreateDoctorProfilePayload, DoctorListItem, DoctorProfile, DoctorProfileApiResponse } from "@/constants/types/doctor";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface DoctorProfileState {
  profile: DoctorProfile | null; // Stores the current doctor's profile
  isLoading: boolean;
  error: string | null;
  allDoctors: DoctorListItem[]
}

const initialState: DoctorProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  allDoctors: []
};

// Async Thunk for creating/completing a doctor profile
export const createDoctorProfile = createAsyncThunk<
  DoctorProfileApiResponse,
  CreateDoctorProfilePayload,
  { rejectValue: string }
>("doctor/createProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<DoctorProfileApiResponse>(
      "/doctor/create",
      profileData
    );
    const data = response.data;

    if (data.success && data.data) {
      return data;
    } else {
      return rejectWithValue(
        data.message ||
          "Failed to create doctor profile. Please check your data."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for fetching a specific doctor's profile (can be used by patient or doctor themselves)
export const fetchDoctorProfileById = createAsyncThunk<
  DoctorProfileApiResponse,
  string,
  { rejectValue: string }
>("doctor/fetchProfileById", async (doctorId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<DoctorProfileApiResponse>(
      `/doctor/${doctorId}`
    );
    const data = response.data;

    if (data.success && data.data) {
      return data;
    } else {
      return rejectWithValue(data.message || "Doctor profile not found.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

export const fetchAllDoctors = createAsyncThunk<
  AllDoctorsApiResponse,
  void,
  { rejectValue: string }
>("doctor/fetchAllDoctors", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<AllDoctorsApiResponse>(
      "/doctor/all"
    ); // Postman: /api/doctor/all
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to fetch all doctors.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

const doctorProfileSlice = createSlice({
  name: "doctorProfile",
  initialState,
  reducers: {
    clearDoctorProfileError: (state) => {
      state.error = null;
    },
    // Useful for directly setting/updating the profile in state if needed without an API call
    setDoctorProfile: (state, action: PayloadAction<DoctorProfile | null>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle createDoctorProfile
      .addCase(createDoctorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDoctorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null; // Store the newly created profile
        state.error = null;
      })
      .addCase(createDoctorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || "Failed to create doctor profile.";
      })
      // Handle fetchDoctorProfileById
      .addCase(fetchDoctorProfileById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null; // Store the fetched profile
        state.error = null;
      })
      .addCase(fetchDoctorProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || "Failed to fetch doctor profile.";
      })
      // NEW: Handle fetchAllDoctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allDoctors = action.payload.data; // Store the list of all doctors
        state.error = null;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.allDoctors = []; // Clear list on error
        state.error = action.payload || 'Failed to fetch all doctors.';
      });
  },
});

export const { clearDoctorProfileError, setDoctorProfile } =
  doctorProfileSlice.actions;
export default doctorProfileSlice.reducer;
