import { CreateTimeslotPayload, FetchTimeslotsForDoctorApiResponse, Timeslot, TimeslotApiResponse } from "@/constants/types/timeslot";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface TimeslotState {
  myTimeslots: Timeslot[]; // Timeslots created by the logged-in doctor
  allDoctorTimeslots: Record<string, Timeslot[]>; // Map of doctorId to their timeslots (for patient browsing)
  isLoading: boolean;
  error: string | null;
}

const initialState: TimeslotState = {
  myTimeslots: [],
  allDoctorTimeslots: {},
  isLoading: false,
  error: null,
};

// Async Thunk for a doctor to create a timeslot
export const createTimeslot = createAsyncThunk<
  TimeslotApiResponse,
  CreateTimeslotPayload,
  { rejectValue: string }
>("timeslot/createTimeslot", async (timeslotData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<TimeslotApiResponse>(
      "/doctor/create-time-slot",
      timeslotData
    );
    const data = response.data;

    if (data.success && data.data) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to create timeslot.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for a doctor to fetch their own timeslots
export const fetchDoctorTimeslots = createAsyncThunk<
  TimeslotApiResponse,
  void,
  { rejectValue: string }
>("timeslot/fetchDoctorTimeslots", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<TimeslotApiResponse>(
      "/doctor/time/all"
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to fetch doctor's timeslots."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for patients to fetch timeslots for a specific doctor
export const fetchTimeslotsForSpecificDoctor = createAsyncThunk<
  FetchTimeslotsForDoctorApiResponse,
  string,
  { rejectValue: string }
>(
  "timeslot/fetchTimeslotsForSpecificDoctor",
  async (doctorId, { rejectWithValue }) => {
    try {
      // Assuming this endpoint based on Postman collection's implied structure
      const response =
        await axiosInstance.get<FetchTimeslotsForDoctorApiResponse>(
          `/doctor/${doctorId}/time/all`
        );
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(
          data.message || `Failed to fetch timeslots for doctor ${doctorId}.`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

const timeslotSlice = createSlice({
  name: "timeslot",
  initialState,
  reducers: {
    clearTimeslotError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createTimeslot
      .addCase(createTimeslot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimeslot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Assuming data.data is the new timeslot object
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.myTimeslots.push(action.payload.data as Timeslot); // Add new timeslot to doctor's own list
        }
      })
      .addCase(createTimeslot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create timeslot.";
      })

      // fetchDoctorTimeslots (for logged-in doctor)
      .addCase(fetchDoctorTimeslots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorTimeslots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (Array.isArray(action.payload.data)) {
          state.myTimeslots = action.payload.data as Timeslot[];
        }
      })
      .addCase(fetchDoctorTimeslots.rejected, (state, action) => {
        state.isLoading = false;
        state.myTimeslots = [];
        state.error = action.payload || "Failed to fetch doctor's timeslots.";
      })

      // fetchTimeslotsForSpecificDoctor (for patients viewing a doctor)
      .addCase(fetchTimeslotsForSpecificDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeslotsForSpecificDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Store timeslots by doctorId
        const doctorId = action.meta.arg; // The doctorId passed to the thunk
        state.allDoctorTimeslots[doctorId] = action.payload.data;
      })
      .addCase(fetchTimeslotsForSpecificDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to fetch specific doctor's timeslots.";
        const doctorId = action.meta.arg;
        state.allDoctorTimeslots[doctorId] = []; // Clear timeslots for this doctor on error
      });
  },
});

export const { clearTimeslotError } = timeslotSlice.actions;
export default timeslotSlice.reducer;
