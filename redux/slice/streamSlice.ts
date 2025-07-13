import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";
import axiosInstance from "@/utils/api/axiosInstance"; // Ensure this path is correct
import { StreamState, StreamUserCredentials } from "@/constants/types/stream"; // Ensure this path is correct
import { RootState } from "../store";

// Stream API Key from your GetStream.io dashboard
// Make sure this is correctly configured in your app.json extra field (e.g., "streamVideoApiKey": "YOUR_KEY")
// and accessed via process.env.EXPO_PUBLIC_STREAM_VIDEO_API_KEY
const STREAM_VIDEO_API_KEY =
  process.env.EXPO_PUBLIC_STREAM_VIDEO_API_KEY || "YOUR_STREAM_VIDEO_API_KEY"; // REPLACE 'YOUR_STREAM_VIDEO_API_KEY'

// Global variable to hold the StreamVideoClient instance
// This is done because SDK instances are non-serializable and should not be in Redux state directly.
let globalStreamVideoClient: StreamVideoClient | null = null;

const initialState: StreamState = {
  streamUser: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

// Async Thunk to connect to Stream Video Client
export const connectStreamUser = createAsyncThunk<
  StreamUserCredentials,
  string,
  { rejectValue: string; state: RootState }
>("stream/connectUser", async (userId, { rejectWithValue, getState }) => {
  try {
    // 1. Get Stream Token from your backend
    const response = await axiosInstance.post<{
      success: boolean;
      token: string;
      message?: string; // Added `message?` to account for optional message in backend response
    }>("/stream/token", { userId });
    if (!response.data.success || !response.data.token) {
      return rejectWithValue(
        response.data.message ||
          "Failed to get Stream token from backend (no token received)."
      );
    }

    const streamToken = response.data.token;
    const appUser = getState().auth.user; // Get app user details from auth slice

    const streamUser = {
      id: userId,
      name: `${appUser?.firstname || "User"} ${appUser?.lastname || ""}`,
      image: appUser?.profilePic || undefined, // Include profile pic if available
    };

    // 2. Initialize and store Stream Video Client globally/in a singleton
    // Only create if it doesn't exist or if the user ID associated with the client changes
    if (
      !globalStreamVideoClient ||
      // @ts-ignore
      globalStreamVideoClient.user?.id !== userId
    ) {
      // Fixed: Added `?` for optional chaining on `user`
      if (globalStreamVideoClient) {
        // Disconnect existing client if connecting a new user
        await globalStreamVideoClient.disconnectUser();
        globalStreamVideoClient = null; // Clear reference before re-initializing
      }
      globalStreamVideoClient = new StreamVideoClient({
        apiKey: STREAM_VIDEO_API_KEY,
        user: streamUser,
        token: streamToken,
      });
      console.log("StreamVideoClient initialized.");
    } else {
      // If client already exists for this user, just log or ensure connection/token is good
      console.log("StreamVideoClient already initialized for this user.");
    }

    return {
      userId,
      token: streamToken,
      userName: streamUser.name,
      userImage: streamUser.image,
    };
  } catch (error: any) {
    console.error(
      "Stream connection error:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to connect to video services.";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to disconnect from Stream Video Client
export const disconnectStreamUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: RootState }
>("stream/disconnectUser", async (_, { rejectWithValue }) => {
  try {
    if (globalStreamVideoClient) {
      await globalStreamVideoClient.disconnectUser();
      globalStreamVideoClient = null; // Clear global reference
      console.log("StreamVideoClient disconnected.");
    }
  } catch (error: any) {
    console.error("Stream disconnection error:", error);
    const errorMessage =
      error.message || "Failed to disconnect from video services.";
    return rejectWithValue(errorMessage);
  }
});

const streamSlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    clearStreamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectStreamUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isConnected = false;
      })
      .addCase(connectStreamUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streamUser = action.payload;
        state.isConnected = true;
        state.error = null;
      })
      .addCase(connectStreamUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Stream connection failed.";
        state.isConnected = false;
        state.streamUser = null;
      })
      .addCase(disconnectStreamUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disconnectStreamUser.fulfilled, (state) => {
        state.isLoading = false;
        state.streamUser = null;
        state.isConnected = false;
        state.error = null;
      })
      .addCase(disconnectStreamUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Stream disconnection failed.";
        // Don't reset state if disconnection failed, user might still be connected
      });
  },
});

export const { clearStreamError } = streamSlice.actions;
export default streamSlice.reducer;
export const getGlobalStreamVideoClient = () => globalStreamVideoClient;
