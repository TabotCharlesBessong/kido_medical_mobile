import { Appointment, AppointmentApiResponse, ApproveAppointmentPayload, BookAppointmentPayload } from "@/constants/types/appointment";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface AppointmentState {
  patientAppointments: Appointment[]; // Appointments booked by the logged-in patient
  doctorAppointments: Appointment[]; // Appointments for the logged-in doctor
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  patientAppointments: [],
  doctorAppointments: [],
  isLoading: false,
  error: null,
};

// Async Thunk for patient to book an appointment
export const bookAppointment = createAsyncThunk<
  AppointmentApiResponse,
  BookAppointmentPayload,
  { rejectValue: string }
>(
  "appointment/bookAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AppointmentApiResponse>(
        "/patient/appointment/create",
        appointmentData
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || "Failed to book appointment.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for a patient to fetch their own appointments
export const fetchPatientAppointments = createAsyncThunk<
  AppointmentApiResponse,
  void,
  { rejectValue: string }
>("appointment/fetchPatientAppointments", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<AppointmentApiResponse>(
      "/patient/appointments"
    ); // Postman: /api/patient/appointments
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch patient appointments."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for a doctor to fetch their own appointments
export const fetchDoctorAppointments = createAsyncThunk<
  AppointmentApiResponse,
  void,
  { rejectValue: string }
>("appointment/fetchDoctorAppointments", async (_, { rejectWithValue }) => {
  try {
    // Assuming an endpoint like /api/doctor/appointments/all or similar for doctor's appointments
    // Based on Postman, there's no specific 'get all doctor appointments' but there is 'approve appointment'
    // For now, I'll use /api/doctor/appointments/all as a placeholder, confirm with backend.
    // If backend only allows fetching by patient ID, this needs adjustment.
    const response = await axiosInstance.get<AppointmentApiResponse>(
      "/doctor/appointments/all"
    ); // Placeholder endpoint
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch doctor appointments."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for a doctor to approve/reject an appointment
export const approveAppointment = createAsyncThunk<
  AppointmentApiResponse,
  ApproveAppointmentPayload,
  { rejectValue: string }
>(
  "appointment/approveAppointment",
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<AppointmentApiResponse>(
        `/doctor/approve/${appointmentId}`,
        { status }
      );
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(
          data.message || `Failed to ${status.toLowerCase()} appointment.`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // bookAppointment
      .addCase(bookAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.patientAppointments.push(action.payload.data as Appointment); // Add new appointment to patient's list
        }
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to book appointment.";
      })

      // fetchPatientAppointments
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.patientAppointments = action.payload.data as Appointment[];
        }
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.patientAppointments = [];
        state.error = action.payload || "Failed to fetch patient appointments.";
      })

      // fetchDoctorAppointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.doctorAppointments = action.payload.data as Appointment[];
        }
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.doctorAppointments = [];
        state.error = action.payload || "Failed to fetch doctor appointments.";
      })

      // approveAppointment
      .addCase(approveAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Update the specific appointment in the doctorAppointments list
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          const updatedAppointment = action.payload.data as Appointment;
          state.doctorAppointments = state.doctorAppointments.map((app:any) =>
            app.id === updatedAppointment.id ? updatedAppointment : app
          );
        }
      })
      .addCase(approveAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update appointment status.";
      });
  },
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
