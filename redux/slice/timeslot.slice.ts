import { TimeSlot } from "@/constants/types";
import { createTimeSlot, fetchTimeSlots, updateTimeSlot } from "../actions/timeslot.action";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TimeSlotState {
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
}

const initialState: TimeSlotState = {
  timeSlots: [],
  loading: false,
  error: null,
};

const timeSlotSlice = createSlice({
  name: "timeslots",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTimeSlots.fulfilled,
        (state, action: PayloadAction<TimeSlot[]>) => {
          state.loading = false;
          state.timeSlots = action.payload;
        }
      )
      .addCase(fetchTimeSlots.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })
      .addCase(createTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createTimeSlot.fulfilled,
        (state, action: PayloadAction<TimeSlot>) => {
          state.loading = false;
          state.timeSlots.push(action.payload);
        }
      )
      .addCase(createTimeSlot.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })
      .addCase(updateTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateTimeSlot.fulfilled,
        (state, action: PayloadAction<TimeSlot>) => {
          state.loading = false;
          const index = state.timeSlots.findIndex(
            (slot) => slot.id === action.payload.id
          );
          if (index !== -1) {
            state.timeSlots[index] = action.payload;
          }
        }
      )
      .addCase(updateTimeSlot.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      });
  },
});

export default timeSlotSlice.reducer;
