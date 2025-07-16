import axios from "axios";
import * as SecureStore from "expo-secure-store"; // For secure token storage
import { store } from "@/redux/store"; // We'll create this soon
import { baseUrl } from "../constants";
import { logout } from "@/redux/slice/authSlice";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token to outgoing requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the current token from Redux state (or SecureStore if Redux isn't initialized yet)
    const token =
      store.getState().auth.token ||
      (await SecureStore.getItemAsync("userToken"));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, especially 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 Unauthorized error and it hasn't been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark to prevent infinite loops

      // Dispatch logout action to clear state and redirect to login
      store.dispatch(logout());
      // Optionally, you might want to show a toast message here
      // e.g., Toast.show({ type: 'error', text1: 'Session Expired', text2: 'Please log in again.' });

      return Promise.reject(error); // Reject the original request
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
