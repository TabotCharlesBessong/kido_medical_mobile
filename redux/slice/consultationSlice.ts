import { Consultation, ConsultationApiResponse, CreateConsultationPayload, UpdateConsultationPayload } from "@/constants/types/consultation";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface ConsultationState {
  currentConsultation: Consultation | null; // For single consultation view/edit
  doctorConsultations: Consultation[]; // Consultations recorded by the logged-in doctor
  patientConsultations: Consultation[]; // Consultations received by the logged-in patient
  isLoading: boolean;
  error: string | null;
}

const initialState: ConsultationState = {
  currentConsultation: null,
  doctorConsultations: [],
  patientConsultations: [],
  isLoading: false,
  error: null,
};

// Async Thunk for a doctor to record a consultation
export const recordConsultation = createAsyncThunk<
  ConsultationApiResponse,
  CreateConsultationPayload,
  { rejectValue: string }
>(
  "consultation/recordConsultation",
  async (consultationData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ConsultationApiResponse>(
        "/doctor/record/consultation",
        consultationData
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Failed to record consultation."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for a doctor to fetch their own recorded consultations
export const fetchDoctorConsultations = createAsyncThunk<
  ConsultationApiResponse,
  void,
  { rejectValue: string }
>("consultation/fetchDoctorConsultations", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ConsultationApiResponse>(
      "/doctor/record/consultation/all"
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch doctor's consultations."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for a patient to fetch their own consultations
export const fetchPatientConsultations = createAsyncThunk<
  ConsultationApiResponse,
  void,
  { rejectValue: string }
>("consultation/fetchPatientConsultations", async (_, { rejectWithValue }) => {
  try {
    // Assuming an endpoint like /api/patient/record/consultation/all
    // If your backend only has the doctor endpoint for ALL, and patient's need their OWN records,
    // you might need a new backend endpoint. For now, assuming a patient-specific one.
    const response = await axiosInstance.get<ConsultationApiResponse>(
      "/patient/record/consultation/all"
    ); // Placeholder endpoint
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch patient's consultations."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch a single consultation by ID (can be used by doctor or patient)
export const fetchSingleConsultation = createAsyncThunk<
  ConsultationApiResponse,
  string,
  { rejectValue: string }
>(
  "consultation/fetchSingleConsultation",
  async (consultationId, { rejectWithValue }) => {
    try {
      // Postman had GET /api/doctor/record/consultation/:id
      // Assuming this endpoint works if the logged-in user (doctor or patient) has access to this consultation.
      const response = await axiosInstance.get<ConsultationApiResponse>(
        `/doctor/record/consultation/${consultationId}`
      );
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Consultation not found or access denied."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to update a consultation (used by doctor)
export const updateConsultation = createAsyncThunk<
  ConsultationApiResponse,
  UpdateConsultationPayload,
  { rejectValue: string }
>(
  "consultation/updateConsultation",
  async ({ consultationId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<ConsultationApiResponse>(
        `/doctor/record/consultation/${consultationId}`,
        payload
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Failed to update consultation."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to delete a consultation (used by doctor)
export const deleteConsultation = createAsyncThunk<
  ConsultationApiResponse,
  string,
  { rejectValue: string }
>(
  "consultation/deleteConsultation",
  async (consultationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<ConsultationApiResponse>(
        `/doctor/record/consultation/${consultationId}`
      );
      const data = response.data;

      if (data.success) {
        return data; // Success response, no data typically returned
      } else {
        return rejectWithValue(
          data.message || "Failed to delete consultation."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    clearConsultationError: (state) => {
      state.error = null;
    },
    clearCurrentConsultation: (state) => {
      state.currentConsultation = null; // Clear the detailed consultation when navigating away
    },
    // Optimistic update for deletion (removes from list immediately)
    removeConsultationFromList: (state, action: PayloadAction<string>) => {
      state.doctorConsultations = state.doctorConsultations.filter(
        (c:Consultation) => c.id !== action.payload
      );
      state.patientConsultations = state.patientConsultations.filter(
        (c:Consultation) => c.id !== action.payload
      ); // Also remove from patient's view if deleted by doctor
    },
  },
  extraReducers: (builder) => {
    builder
      // recordConsultation
      .addCase(recordConsultation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordConsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.doctorConsultations.push(action.payload.data as Consultation); // Add new consultation to doctor's list
        }
      })
      .addCase(recordConsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to record consultation.";
      })

      // fetchDoctorConsultations
      .addCase(fetchDoctorConsultations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorConsultations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.doctorConsultations = action.payload.data as Consultation[];
        }
      })
      .addCase(fetchDoctorConsultations.rejected, (state, action) => {
        state.isLoading = false;
        state.doctorConsultations = [];
        state.error =
          action.payload || "Failed to fetch doctor's consultations.";
      })

      // fetchPatientConsultations
      .addCase(fetchPatientConsultations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientConsultations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.patientConsultations = action.payload.data as Consultation[];
        }
      })
      .addCase(fetchPatientConsultations.rejected, (state, action) => {
        state.isLoading = false;
        state.patientConsultations = [];
        state.error =
          action.payload || "Failed to fetch patient's consultations.";
      })

      // fetchSingleConsultation
      .addCase(fetchSingleConsultation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentConsultation = null; // Clear previous detail when new fetch starts
      })
      .addCase(fetchSingleConsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.currentConsultation = action.payload.data as Consultation;
        }
      })
      .addCase(fetchSingleConsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.currentConsultation = null;
        state.error = action.payload || "Failed to fetch consultation details.";
      })

      // updateConsultation
      .addCase(updateConsultation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          const updatedConsultation = action.payload.data as Consultation;
          state.currentConsultation = updatedConsultation; // Update current detailed consultation
          // Also update in lists if desired
          state.doctorConsultations = state.doctorConsultations.map((c:Consultation) =>
            c.id === updatedConsultation.id ? updatedConsultation : c
          );
          // If patient consultations are based on a shared list, update there too:
          state.patientConsultations = state.patientConsultations.map((c:Consultation) =>
            c.id === updatedConsultation.id ? updatedConsultation : c
          );
        }
      })
      .addCase(updateConsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update consultation.";
      })

      // deleteConsultation (optimistic update via removeConsultationFromList reducer)
      .addCase(deleteConsultation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteConsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The list update is handled by the `removeConsultationFromList` reducer,
        // which should be dispatched from the component *before* the thunk is awaited.
      })
      .addCase(deleteConsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete consultation.";
        // If optimistic update failed, you might want to re-fetch the list here
        // dispatch(fetchDoctorConsultations());
      });
  },
});

export const {
  clearConsultationError,
  clearCurrentConsultation,
  removeConsultationFromList,
} = consultationSlice.actions;
export default consultationSlice.reducer;
