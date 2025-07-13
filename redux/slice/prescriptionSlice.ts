import { CreatePrescriptionPayload, Prescription, PrescriptionApiResponse, UpdatePrescriptionPayload } from "@/constants/types/prescription";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface PrescriptionState {
  currentPrescription: Prescription | null; // For single prescription view/edit
  doctorPrescriptions: Prescription[]; // Prescriptions issued by the logged-in doctor
  patientPrescriptions: Prescription[]; // Prescriptions received by the logged-in patient
  isLoading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  currentPrescription: null,
  doctorPrescriptions: [],
  patientPrescriptions: [],
  isLoading: false,
  error: null,
};

// Async Thunk for a doctor to create a prescription
export const createPrescription = createAsyncThunk<
  PrescriptionApiResponse,
  CreatePrescriptionPayload,
  { rejectValue: string }
>(
  "prescription/createPrescription",
  async (prescriptionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PrescriptionApiResponse>(
        "/doctor/record/prescription",
        prescriptionData
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Failed to create prescription."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for a doctor to fetch their own issued prescriptions
export const fetchDoctorPrescriptions = createAsyncThunk<
  PrescriptionApiResponse,
  void,
  { rejectValue: string }
>("prescription/fetchDoctorPrescriptions", async (_, { rejectWithValue }) => {
  try {
    // Assuming an endpoint like /api/doctor/record/prescription/all
    const response = await axiosInstance.get<PrescriptionApiResponse>(
      "/doctor/record/prescription/all"
    ); // Placeholder endpoint
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch doctor's prescriptions."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for a patient to fetch their own received prescriptions
export const fetchPatientPrescriptions = createAsyncThunk<
  PrescriptionApiResponse,
  void,
  { rejectValue: string }
>("prescription/fetchPatientPrescriptions", async (_, { rejectWithValue }) => {
  try {
    // Assuming an endpoint like /api/patient/record/prescription/all or /api/patient/prescriptions
    const response = await axiosInstance.get<PrescriptionApiResponse>(
      "/patient/record/prescription/all"
    ); // Placeholder endpoint
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch patient's prescriptions."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch a single prescription by ID (can be used by doctor or patient)
export const fetchSinglePrescription = createAsyncThunk<
  PrescriptionApiResponse,
  string,
  { rejectValue: string }
>(
  "prescription/fetchSinglePrescription",
  async (prescriptionId, { rejectWithValue }) => {
    try {
      // Assuming a generic endpoint that checks user's permission to view the prescription
      // e.g., accessible by the doctor who issued it or the patient it's for
      const response = await axiosInstance.get<PrescriptionApiResponse>(
        `/doctor/record/prescription/${prescriptionId}`
      ); // Postman had /doctor/record/consultation/:id, assuming similar for prescription
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Prescription not found or access denied."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// (Optional) Async Thunk to update a prescription
export const updatePrescription = createAsyncThunk<
  PrescriptionApiResponse,
  UpdatePrescriptionPayload,
  { rejectValue: string }
>(
  "prescription/updatePrescription",
  async ({ prescriptionId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<PrescriptionApiResponse>(
        `/doctor/record/prescription/${prescriptionId}`,
        payload
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(
          data.message || "Failed to update prescription."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    clearPrescriptionError: (state) => {
      state.error = null;
    },
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null; // Clear detail view when navigating away
    },
    // (Optional) Add a reducer for optimistic updates or specific list updates
    // For example, to add a newly created prescription to the doctor's list immediately
    addPrescriptionToDoctorList: (
      state,
      action: PayloadAction<Prescription>
    ) => {
      state.doctorPrescriptions.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // createPrescription
      .addCase(createPrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          // If you want to auto-update the list after creation:
          state.doctorPrescriptions.push(action.payload.data as Prescription);
        }
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create prescription.";
      })

      // fetchDoctorPrescriptions
      .addCase(fetchDoctorPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.doctorPrescriptions = action.payload.data as Prescription[];
        }
      })
      .addCase(fetchDoctorPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.doctorPrescriptions = [];
        state.error =
          action.payload || "Failed to fetch doctor's prescriptions.";
      })

      // fetchPatientPrescriptions
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.patientPrescriptions = action.payload.data as Prescription[];
        }
      })
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.patientPrescriptions = [];
        state.error =
          action.payload || "Failed to fetch patient's prescriptions.";
      })

      // fetchSinglePrescription
      .addCase(fetchSinglePrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentPrescription = null; // Clear previous detail when new fetch starts
      })
      .addCase(fetchSinglePrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.currentPrescription = action.payload.data as Prescription;
        }
      })
      .addCase(fetchSinglePrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = null;
        state.error = action.payload || "Failed to fetch prescription details.";
      })

      // (Optional) updatePrescription
      .addCase(updatePrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.currentPrescription = action.payload.data as Prescription; // Update current detailed prescription
          // Also update in lists if desired
          state.doctorPrescriptions = state.doctorPrescriptions.map((p:any) =>
            p.id === (action.payload.data as Prescription).id
              ? (action.payload.data as Prescription)
              : p
          );
          state.patientPrescriptions = state.patientPrescriptions.map((p:any) =>
            p.id === (action.payload.data as Prescription).id
              ? (action.payload.data as Prescription)
              : p
          );
        }
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update prescription.";
      });
  },
});

export const {
  clearPrescriptionError,
  clearCurrentPrescription,
  addPrescriptionToDoctorList,
} = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
