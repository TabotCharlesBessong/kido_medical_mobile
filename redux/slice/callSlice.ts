import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api/axiosInstance"; // Ensure correct path
import {
  CallRecord,
  CallApiResponse,
  InitiateCallApiResponse,
  CreateCallPayload,
  EndCallPayload,
} from "@/constants/types/call"; // Ensure correct path
import { RootState } from "../store";
import { getGlobalStreamVideoClient } from "./streamSlice"; // Fixed import: Using named import

interface CallState {
  currentBackendCallRecord: CallRecord | null; // The backend's record of the active call
  allCalls: CallRecord[]; // List of all calls (e.g., for history)
  callStatus:
    | "idle"
    | "initiating"
    | "joining"
    | "connected"
    | "failed"
    | "ended"
    | "leaving";
  callError: string | null;
  isLoading: boolean; // Added general isLoading
}

const initialState: CallState = {
  currentBackendCallRecord: null,
  allCalls: [],
  callStatus: "idle",
  callError: null,
  isLoading: false, // Initialize isLoading
};

// Async Thunk for Doctor to initiate a call via your backend
export const initiateCall = createAsyncThunk<
  InitiateCallApiResponse,
  CreateCallPayload,
  { rejectValue: string; state: RootState }
>("call/initiateCall", async (payload, { rejectWithValue, getState }) => {
  const videoClient = getGlobalStreamVideoClient(); // Fixed: Called without arguments
  if (!videoClient) {
    return rejectWithValue(
      "Stream Video client not connected. Please ensure you are logged in."
    );
  }
  try {
    const response = await axiosInstance.post<InitiateCallApiResponse>(
      "/call/create",
      payload
    );
    const data = response.data;

    if (data.success && data.data) {
      // Frontend now has the `streamToken` and `channelId` (streamCallId) from backend
      // The Stream SDK Call object will be created/joined on the CallScreen directly.
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to initiate call from backend."
      );
    }
  } catch (error: any) {
    console.error(
      "Error initiating call:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch a specific CallRecord from your backend
export const fetchCallRecordById = createAsyncThunk<
  CallApiResponse,
  string,
  { rejectValue: string }
>("call/fetchCallRecordById", async (callId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<CallApiResponse>(
      `/call/${callId}`
    );
    const data = response.data;

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Call record not found.");
    }
  } catch (error: any) {
    console.error(
      "Error fetching call record:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for Doctor/Patient to prepare to join a Stream Video Call
// It doesn't join, just verifies the client and returns the streamCallId needed for UI.
export const prepareToJoinStreamCall = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>(
  "call/prepareToJoinStreamCall",
  async (streamCallId, { rejectWithValue, getState }) => {
    const videoClient = getGlobalStreamVideoClient(); // Fixed: Called without arguments
    if (!videoClient) {
      return rejectWithValue(
        "Stream Video client not connected. Please ensure you are logged in and Stream SDK is initialized."
      );
    }
    // Client is ready, pass the streamCallId to the UI to handle actual Stream SDK call object creation/joining
    return streamCallId;
  }
);

// Async Thunk to end a call via your backend
export const endBackendCall = createAsyncThunk<
  CallApiResponse,
  EndCallPayload,
  { rejectValue: string; state: RootState }
>("call/endBackendCall", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<CallApiResponse>(
      `/call/${payload.callId}/end`
    );
    const data = response.data;

    if (data.success && data.data) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to end call on backend.");
    }
  } catch (error: any) {
    console.error(
      "Error ending call on backend:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    clearCallError: (state) => {
      state.callError = null;
    },
    setCallStatus: (state, action: PayloadAction<CallState["callStatus"]>) => {
      state.callStatus = action.payload;
    },
    resetCallState: (state) => {
      state.currentBackendCallRecord = null;
      state.callStatus = "idle";
      state.callError = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // initiateCall (Doctor calls patient via backend)
      .addCase(initiateCall.pending, (state) => {
        state.isLoading = true; // Use isLoading for thunk
        state.callStatus = "initiating";
        state.callError = null;
      })
      .addCase(initiateCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBackendCallRecord = action.payload.data?.call || null;
        state.callStatus = "connected"; // Marking as connected since backend initiated it and we have streamCallId
        state.callError = null;
      })
      .addCase(initiateCall.rejected, (state, action) => {
        state.isLoading = false;
        state.callStatus = "failed";
        state.callError = action.payload || "Failed to initiate call.";
        state.currentBackendCallRecord = null;
      })

      // prepareToJoinStreamCall (for UI to create Stream SDK Call object)
      .addCase(prepareToJoinStreamCall.pending, (state) => {
        state.isLoading = true; // Use isLoading for thunk
        state.callStatus = "joining";
        state.callError = null;
      })
      .addCase(prepareToJoinStreamCall.fulfilled, (state, action) => {
        state.isLoading = false;
        // The actual Stream SDK Call object is NOT stored here.
        // It's created in the UI component.
        state.callStatus = "connected"; // Frontend is ready to render the call UI
        state.callError = null;
      })
      .addCase(prepareToJoinStreamCall.rejected, (state, action) => {
        state.isLoading = false;
        state.callStatus = "failed";
        state.callError = action.payload || "Failed to prepare for video call.";
      })

      // endBackendCall (when either party ends via backend)
      .addCase(endBackendCall.pending, (state) => {
        state.isLoading = true; // Use isLoading for thunk
        state.callStatus = "leaving";
        state.callError = null;
      })
      .addCase(endBackendCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBackendCallRecord = action.payload.data as CallRecord; // Update status to completed
        state.callStatus = "ended";
        state.callError = null;
      })
      .addCase(endBackendCall.rejected, (state, action) => {
        state.isLoading = false;
        state.callStatus = "failed";
        state.callError = action.payload || "Failed to end call on backend.";
      })

      // fetchCallRecordById (for getting specific call records)
      .addCase(fetchCallRecordById.pending, (state) => {
        state.isLoading = true; // Use isLoading here for fetching history
        state.callError = null;
      })
      .addCase(fetchCallRecordById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBackendCallRecord = action.payload.data as CallRecord;
        state.callError = null;
      })
      .addCase(fetchCallRecordById.rejected, (state, action) => {
        state.isLoading = false;
        state.callError = action.payload || "Failed to fetch call record.";
      });
  },
});

export const { clearCallError, setCallStatus, resetCallState } =
  callSlice.actions;
export default callSlice.reducer;
