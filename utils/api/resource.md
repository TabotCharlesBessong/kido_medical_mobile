Excellent! Providing the existing component code is very helpful. It allows me to tailor the Redux Toolkit integration precisely to your current structure, minimizing redundant changes and ensuring compatibility.

You're right, the current implementation handles authentication locally using `useState` and `AsyncStorage`. Connecting it to Redux slices is a significant improvement for state management, especially in a complex application like a telemedicine platform where user authentication and data will be central to many features.

Let's refactor your authentication flow to use Redux Toolkit.

---

### Phase 1: Redux Toolkit Integration for Authentication

Here's the plan:

1.  **Define Types:** Create TypeScript interfaces for your authentication state and API payloads/responses.
2.  **Axios Setup:** Set up an `axios` instance with request and response interceptors to automatically handle JWT tokens and common errors (like 401 Unauthorized for expired tokens). This will replace direct `fetch` calls.
3.  **Auth Redux Slice:** Create `authSlice` using `createSlice` and `createAsyncThunk` to manage login, registration, and verification logic. This slice will hold the user object, JWT token, loading state, and any errors.
4.  **Redux Store Configuration:** Configure your Redux store with the `authSlice`.
5.  **Root Component Integration:** Update your root component (`app/_layout.tsx` for Expo Router) to provide the Redux store and handle conditional navigation based on the authentication state (logged in vs. logged out).
6.  **Refactor Components:** Update `LoginScreen`, `RegisterScreen`, and `VerifyScreen` to dispatch Redux thunks and consume state from the Redux store.
7.  **Secure Storage:** Use `expo-secure-store` for sensitive data like the JWT token (already using `AsyncStorage`, but `SecureStore` is more secure for this purpose).

---

Let's go step-by-step.

**Step 1: Create `types/auth.ts`**

First, create a `types` folder in your `src` directory (e.g., `src/types`) and define the necessary interfaces.

```typescript
// src/types/auth.ts

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string; // "PATIENT", "DOCTOR", "ADMIN" - essential for role-based features
  isVerified?: boolean; // Assuming this might be returned, or can be added based on backend logic
  // Add any other user properties returned by the login/register API, e.g., phoneNumber, profilePic, etc.
  // For doctor/patient specific details, we'll have separate slices/interfaces later
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Payloads for API requests
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  // `confirmPassword` is for frontend validation only, not sent to backend
}

export interface VerifyPayload {
  email: string;
  code: string; // Corrected from 'token' to 'code' as per your Postman collection
}

// API Response Structures (based on your Postman responses)
export interface AuthResponseData {
  token: string;
  user: User;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: AuthResponseData; // For login, this will contain token and user
  // For register/verify, `data` might be empty or contain a simple success message
}
```

**Step 2: Update `utils/constants.ts` and Create `utils/axiosInstance.ts`**

Ensure your `baseUrl` is correctly defined to include the `/api` prefix, as shown in your Postman collection.

```typescript
// src/utils/constants.ts

export const baseUrl = "http://localhost:5000/api"; // Make sure this matches your backend API base URL
export const COLORS = {
  // Assuming COLORS is defined here or imported from theme.ts
  primary: "#0C6CF2", // Example color, adjust as per your theme
  danger: "red",
  // ... other colors
};
```

Now, create `src/utils/axiosInstance.ts`. This file will set up Axios with interceptors to automatically include your JWT token in requests and handle common response errors (like 401 Unauthorized).

```typescript
// src/utils/axiosInstance.ts

import axios from 'axios';
import { baseUrl } from './constants';
import * as SecureStore from 'expo-secure-store'; // For secure token storage
import { store } from '@/redux/store'; // We'll create this soon
import { logout } from '@/redux/slices/authSlice'; // We'll create this soon

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to outgoing requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the current token from Redux state (or SecureStore if Redux isn't initialized yet)
    const token = store.getState().auth.token || await SecureStore.getItemAsync('userToken');
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
```

**Step 3: Create `redux/slices/authSlice.ts`**

Now, define your Redux Toolkit slice for authentication. Create `src/redux/slices/authSlice.ts`.

```typescript
// src/redux/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';
import * as SecureStore from 'expo-secure-store';
import { AuthState, LoginPayload, RegisterPayload, VerifyPayload, AuthApiResponse, User } from '@/types/auth'; // Adjust path if needed

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk<AuthApiResponse, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthApiResponse>('/user/login', credentials);
      const data = response.data;

      if (data.success && data.data) {
        // Securely store the token and user data
        await SecureStore.setItemAsync('userToken', data.data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.data.user));
        return data;
      } else {
        return rejectWithValue(data.message || 'Login failed.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for User Registration
export const registerUser = createAsyncThunk<AuthApiResponse, RegisterPayload, { rejectValue: string }>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthApiResponse>('/user/register', userData);
      const data = response.data;

      if (data.success) {
        return data; // Registration usually doesn't return a token, just a success status
      } else {
        return rejectWithValue(data.message || 'Registration failed.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for User Verification
export const verifyAccount = createAsyncThunk<AuthApiResponse, VerifyPayload, { rejectValue: string }>(
  'auth/verifyAccount',
  async (verificationData, { rejectWithValue }) => {
    try {
      // Corrected endpoint based on Postman collection: /user/verify-account
      const response = await axiosInstance.post<AuthApiResponse>('/user/verify-account', verificationData);
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Account verification failed.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to load user data from SecureStore on app launch
export const loadUserFromStorage = createAsyncThunk<AuthState, void, { rejectValue: string }>(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userDataString = await SecureStore.getItemAsync('userData');

      if (token && userDataString) {
        const user: User = JSON.parse(userDataString);
        return { user, token, isLoading: false, error: null };
      } else {
        return rejectWithValue('No user data found in storage.');
      }
    } catch (error: any) {
      // In case of parsing error or other storage issues
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      return rejectWithValue(error.message || 'Failed to load user from storage.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to clear authentication state (for logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      SecureStore.deleteItemAsync('userToken'); // Clear from storage
      SecureStore.deleteItemAsync('userData');   // Clear from storage
    },
    // Reducer to clear specific authentication errors, useful for forms
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Thunk handling
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Login failed.';
      })
      // Register Thunk handling
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // After successful registration, user is not automatically logged in.
        // They need to verify their account first.
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed.';
      })
      // Verify Account Thunk handling
      .addCase(verifyAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Account verification failed.';
      })
      // Load User From Storage Thunk handling
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Failed to load session.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions; // Export individual actions
export default authSlice.reducer; // Export the reducer as default
```

**Step 4: Configure Redux Store in `redux/store.ts`**

Create `src/redux/store.ts`.

```typescript
// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// Import other reducers as you create them for other parts of the app
// import patientProfileReducer from './slices/patientProfileSlice';
// import doctorProfileReducer from './slices/doctorProfileSlice';
// import postsReducer from './slices/postsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Add your auth reducer here
    // Add other feature reducers here:
    // patientProfile: patientProfileReducer,
    // doctorProfile: doctorProfileReducer,
    // posts: postsReducer,
  },
  // `middleware` is automatically added by `configureStore` to include redux-thunk
});

// Define RootState and AppDispatch types for better TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Step 5: Integrate Redux Provider in Root Component (`app/_layout.tsx`)**

This is crucial for making the Redux store available to your entire app and for handling the initial load and authentication-based routing.

```typescript
// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store, AppDispatch, RootState } from '@/redux/store'; // Import your Redux store
import { loadUserFromStorage } from '@/redux/slices/authSlice'; // Import the thunk to load user data
import { useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native'; // For loading indicator

// Create a component that wraps your navigation logic
// This allows us to use Redux hooks for conditional rendering
function RootNavigator() {
  const dispatch: AppDispatch = useDispatch();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  const [isAppReady, setIsAppReady] = React.useState(false);

  useEffect(() => {
    // Load user token and data from SecureStore when the app starts
    const prepareApp = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
      } catch (e) {
        console.warn("No existing user session or failed to load:", e);
      } finally {
        setIsAppReady(true);
      }
    };
    prepareApp();
  }, [dispatch]);

  // If the app is still loading user data from storage, show a splash/loading screen
  if (!isAppReady || isLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading app...</Text>
      </View>
    );
  }

  return (
    <Stack>
      {token ? (
        // User is logged in, show the main application tabs
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // User is not logged in, show authentication screens
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
      {/* Fallback for any unmatched routes */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Main App component wrapping with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

You'll also need to ensure your `app/auth/_layout.tsx` and `app/(tabs)/_layout.tsx` are correctly set up:

```typescript
// app/auth/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="forgot" options={{ headerShown: false }} /> {/* Add if you have a forgot password screen */}
      {/* Add other auth-related screens here */}
    </Stack>
  );
}
```

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Example icon library

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" // This maps to app/(tabs)/index.tsx for your home screen
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: false, // Hide header if you prefer custom header or no header
        }}
      />
      {/* Add other main app tabs here */}
      {/* Example: */}
      {/* <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
```

**Step 6: Refactor `app/auth/login.tsx`**

We'll replace local state for loading and error with Redux state, and dispatch the `loginUser` thunk.

```typescript
// app/auth/login.tsx

import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks for state and dispatch

import { AppButton, AppLink, AuthInputField, CustomText, PasswordVisibilityIcon } from "@/components";
import { COLORS } from "@/constants/theme";
import { loginUser, clearAuthError } from "@/redux/slices/authSlice"; // Import login thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface SigninValues {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true); // Default to true for secure password input
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch(); // Get the dispatch function
  const { isLoading, error, token, user } = useSelector((state: RootState) => state.auth); // Get relevant state from Redux

  // Clear authentication error when component mounts or user interaction implies new attempt
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Effect to navigate after successful login (when token becomes available)
  useEffect(() => {
    if (token && user) { // Ensure both token and user data are present
      router.replace("/(tabs)"); // Use replace to prevent going back to login screen after successful login
    }
  }, [token, user, router]); // Re-run effect when token or user changes

  const initialValues: SigninValues = {
    email: "",
    password: "",
  };

  const loginSchema = yup.object({ // Renamed from signupSchema for clarity
    email: yup
      .string()
      .trim(t("login.yup.email.trim"))
      .email(t("login.yup.email.email"))
      .required(t("login.yup.email.required")),
    password: yup
      .string()
      .trim(t("login.yup.password.trim"))
      .min(8, t("login.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("login.yup.password.matches")
      )
      .required(t("login.yup.password.required")),
  });

  const handleSubmit = async (
    values: SigninValues,
    actions: FormikHelpers<SigninValues>
  ) => {
    // Dispatch the loginUser async thunk
    dispatch(loginUser(values));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("login.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              placeholder={t("login.form.placeholder1")}
              label={t("login.form.label1")}
              containerStyle={styles.inputField}
              keyboardType="email-address" // Recommended for email inputs
              autoCapitalize="none" // Prevents auto-capitalization for email
            />
            <AuthInputField
              name="password"
              placeholder={t("login.form.placeholder2")}
              label={t("login.form.label2")}
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry} // Controlled by local state
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            {error && <Text style={styles.errorText}>{error}</Text>} {/* Display Redux error */}
            <View style={styles.bottomLinks}>
              <CustomText type="body5">
                {t("login.forgotText")}
              </CustomText>
              <AppLink
                title={t("login.forgotLink")}
                onPress={() => router.push({ pathname: "/auth/forgot" })}
              />
            </View>
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("login.button")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("login.loading")}
              containerStyle={styles.appButton}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">
                {t("login.registerText")}
              </CustomText>
              <AppLink
                title={t("login.registerLink")}
                onPress={() => router.push({ pathname: "/auth/register" })}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 16, // Added horizontal padding for overall container
  },
  formContainer: {
    width: "100%", // Ensures Formik content takes full width
    alignItems: "center", // Center items within the form
  },
  inputField: {
    marginBottom: 16,
    width: "100%", // Ensures input fields take full width of formContainer
  },
  bottomLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    width: "100%", // Ensure links take full width of formContainer
    paddingHorizontal: 5, // Add some padding for the links
  },
  appButton: {
    width: "100%", // Ensures button takes full width of formContainer
  },
  errorText: {
    color: COLORS.danger, // Use defined danger color
    marginBottom: 10,
    alignSelf: 'center', // Center the error text if it's there
    textAlign: 'center',
    width: '100%',
  },
});
```

**Step 7: Refactor `app/auth/register.tsx`**

Similar to login, we'll dispatch the `registerUser` thunk and use Redux state for loading and errors.

```typescript
// app/auth/register.tsx

import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks

import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { registerUser, clearAuthError } from "@/redux/slices/authSlice"; // Import register thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface SignupValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [secureTextEntry, setSecureTextEntry] = useState(true); // Default to true

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Clear authentication error when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: SignupValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object({
    firstname: yup.string().required(t("register.yup.firstname.required")),
    lastname: yup.string().required(t("register.yup.lastname.required")),
    email: yup.string().email(t("register.yup.email.invalid")).required(t("register.yup.email.required")),
    password: yup
      .string()
      .required(t("register.yup.password.required"))
      .min(8, t("register.yup.password.min"))
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        t("register.yup.password.matches")
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("register.yup.confirmPassword.match"))
      .required(t("register.yup.confirmPassword.required")),
  });

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    // Destructure to exclude confirmPassword from being sent to the backend
    const { confirmPassword, ...dataToSend } = values;
    const resultAction = await dispatch(registerUser(dataToSend));

    // Check if the thunk was fulfilled (successful)
    if (registerUser.fulfilled.match(resultAction)) {
      // Navigate to verification screen on success
      router.push("/auth/verify");
    }
    // Error handling is managed by the Redux state and displayed in the UI
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("register.title")}</CustomText>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="firstname"
              label={t("register.form.label1")}
              placeholder={t("register.form.placeholder1")}
              containerStyle={styles.inputField}
              autoCapitalize="words" // Capitalize first letter of words
            />
            <AuthInputField
              name="lastname"
              label={t("register.form.label2")}
              placeholder={t("register.form.placeholder2")}
              containerStyle={styles.inputField}
              autoCapitalize="words"
            />
            <AuthInputField
              name="email"
              label={t("register.form.label3")}
              placeholder={t("register.form.placeholder3")}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="password"
              label={t("register.form.label4")}
              placeholder={t("register.form.placeholder4")}
              secureTextEntry={secureTextEntry}
              rightIcon={<PasswordVisibilityIcon privateIcon={secureTextEntry} />}
              onRightIconPress={() => setSecureTextEntry(!secureTextEntry)}
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="confirmPassword"
              label={t("register.form.label5")}
              placeholder={t("register.form.placeholder5")}
              secureTextEntry={secureTextEntry}
              rightIcon={<PasswordVisibilityIcon privateIcon={secureTextEntry} />}
              onRightIconPress={() => setSecureTextEntry(!secureTextEntry)}
              containerStyle={styles.inputField}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AppButton
              title={t("register.button")}
              onPress={handleSubmit}
              backgroundColor={COLORS.primary}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("register.loading")}
              containerStyle={styles.appButton}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("register.loginText")}</CustomText>
              <AppLink title={t("register.loginLink")} onPress={() => router.push("/auth/login")} />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 16,
    width: "100%",
  },
  formContainer: {
    width: "100%", // Ensures Formik content takes full width
    alignItems: "center", // Center items within the form
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  appButton: {
    width: "100%",
    marginTop: 10, // Added margin top for spacing
  },
  bottomLinks: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
});
```

**Step 8: Refactor `app/auth/verify.tsx`**

This screen will dispatch the `verifyAccount` thunk.

```typescript
// app/auth/verify.tsx

import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Text } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { useTranslation } from "react-i18next"; // Ensure you're importing useTranslation

import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme"; // Import COLORS for consistent styling
import { verifyAccount, clearAuthError } from "@/redux/slices/authSlice"; // Import verify thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface VerifyValues {
  email: string;
  code: string; // Renamed from 'token' to 'code' as per Postman and type definition
}

const VerifyScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Clear authentication error when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: VerifyValues = {
    email: "",
    code: "",
  };

  const schema = yup.object({
    email: yup.string().email(t("verify.yup.email.invalid")).required(t("verify.yup.email.required")),
    code: yup.string().required(t("verify.yup.code.required")),
  });

  const handleSubmit = async (
    values: VerifyValues,
    actions: FormikHelpers<VerifyValues>
  ) => {
    const resultAction = await dispatch(verifyAccount(values));

    if (verifyAccount.fulfilled.match(resultAction)) {
      // Account verified successfully, navigate to login
      // Optionally show a success message here (e.g., using a toast library)
      router.push("/auth/login");
    }
    // Error handling is managed by the Redux state and displayed in the UI
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("verify.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              label={t("verify.form.label1")}
              placeholder={t("verify.form.placeholder1")}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="code" // Corrected name
              label={t("verify.form.label2")} // Corrected name
              placeholder={t("verify.form.placeholder2")} // Corrected name
              containerStyle={styles.inputField}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AppButton
              title={t("verify.button")}
              onPress={handleSubmit}
              backgroundColor={COLORS.primary}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("verify.loading")}
              containerStyle={{ marginTop: 16, width: "100%" }} // Ensure button takes full width
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
    width: "100%",
  },
  formContainer: {
    width: "100%", // Ensures Formik content takes full width
    alignItems: "center", // Center items within the form
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
});
```

---

**Summary of Key Changes and Benefits:**

*   **Centralized State:** Your `user`, `token`, `isLoading`, and `error` states for authentication are now in a single `authSlice` in Redux, making them accessible throughout your application.
*   **Asynchronous Logic:** `createAsyncThunk` neatly handles the lifecycle of your API calls (pending, fulfilled, rejected), simplifying component logic.
*   **Error Handling:** Errors from API calls are now consistently caught and stored in the Redux state, which can be easily displayed in your UI. The `clearAuthError` action helps manage transient error messages.
*   **Loading States:** All loading indicators are tied to the `isLoading` state from Redux.
*   **Token Management:** `axiosInstance` automatically attaches the JWT token to outgoing requests and handles 401 Unauthorized responses by dispatching `logout`, leading to a more robust session management. `SecureStore` is used for persistent, secure storage of the token.
*   **Decoupled Logic:** Your UI components (Login, Register, Verify) are now cleaner, focusing on user interaction and rendering, while the API logic is abstracted into the Redux thunks.
*   **Type Safety:** Strong typing throughout with `TypeScript` ensures data consistency and helps catch errors during development.
*   **Improved UX:** The root navigator handles showing a loading screen while `loadUserFromStorage` fetches the session, providing a smoother startup experience.

**Before Running:**

1.  **Install Dependencies:**
    ```bash
    npm install @reduxjs/toolkit react-redux axios expo-secure-store yup formik react-i18next i18next @expo/vector-icons
    # If you haven't already:
    npm install @react-native-async-storage/async-storage # (If you plan to use this for non-sensitive data, but SecureStore for token)
    ```
2.  **`PasswordVisibilityIcon`, `CustomText`, `AppInput`, `AppLink`:** Ensure these components exist in your `@/components` and `@/ui/form` paths respectively. The provided code assumes their presence.
3.  **i18n Setup:** Make sure your `i18next` configuration is properly set up and you have the translation keys (e.g., `login.yup.email.required`, `register.form.label1`, etc.) defined in your translation files.

This completes Phase 1, establishing a robust authentication system. We can now proceed to Phase 2 (User Profiles & Core Content Feed) knowing that the foundation for user management is solid. Let me know when you're ready!


Got it! We'll integrate the "Forgot Password" and "Reset Password" functionalities into our `authSlice` using Redux Toolkit, following the same pattern as the other authentication flows.

This involves:
1.  **Updating `types/auth.ts`:** Adding interfaces for Forgot/Reset password payloads and responses.
2.  **Updating `redux/slices/authSlice.ts`:** Adding `createAsyncThunk` for `forgotPassword` and `resetPassword` API calls and handling their states in `extraReducers`.
3.  **Refactoring `app/auth/forgot.tsx` and `app/auth/reset.tsx`:** Replacing local state management with Redux dispatch and selectors.

Let's do it!

---

### Step 1: Update `types/auth.ts`

Add the new interfaces for the password reset flow.

```typescript
// src/types/auth.ts (add these to your existing file)

// ... (existing interfaces like User, AuthState, LoginPayload, etc.)

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  code: string; // Changed from 'token' to 'code' based on your Postman collection and code
  // confirmPassword is for frontend validation only
}

// Backend response for forgot password might contain the code or just a success message
export interface ForgotPasswordApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: {
      code: string; // The backend returns the code here
    };
  };
}

export interface ResetPasswordApiResponse {
  success: boolean;
  message: string;
}
```

---

### Step 2: Update `redux/slices/authSlice.ts`

We'll add two new `createAsyncThunk` functions: `forgotPassword` and `resetPassword`, and extend the `extraReducers` to handle their lifecycle.

```typescript
// src/redux/slices/authSlice.ts (updated content)

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';
import * as SecureStore from 'expo-secure-store';
import {
  AuthState,
  LoginPayload,
  RegisterPayload,
  VerifyPayload,
  ForgotPasswordPayload, // New
  ResetPasswordPayload,  // New
  AuthApiResponse,
  ForgotPasswordApiResponse, // New
  ResetPasswordApiResponse,  // New
  User
} from '@/types/auth';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// ... (existing loginUser, registerUser, verifyAccount, loadUserFromStorage thunks)

// Async Thunk for Forgot Password (Request Code)
export const forgotPassword = createAsyncThunk<ForgotPasswordApiResponse, ForgotPasswordPayload, { rejectValue: string }>(
  'auth/forgotPassword',
  async (emailPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ForgotPasswordApiResponse>('/user/forgot-password', emailPayload);
      const data = response.data;

      if (data.success) {
        // You might want to save the 'code' temporarily if needed for auto-filling the next screen
        // However, usually, this code is sent to the user's email, not directly returned to the frontend.
        // If your backend *does* return it for testing/dev purposes, you could save it.
        // For production, the user would check their email.
        if (data.data?.token?.code) {
          await SecureStore.setItemAsync('resetCode', data.data.token.code); // For development/testing
        }
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to request password reset.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for Reset Password
export const resetPassword = createAsyncThunk<ResetPasswordApiResponse, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      // Remove confirmPassword as it's only for frontend validation
      const { confirmPassword, ...dataToSend } = resetData;
      const response = await axiosInstance.post<ResetPasswordApiResponse>('/user/reset-password', dataToSend);
      const data = response.data;

      if (data.success) {
        await SecureStore.deleteItemAsync('resetCode'); // Clear the temporary code after successful reset
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ... (existing logout, clearAuthError reducers)
  },
  extraReducers: (builder) => {
    builder
      // ... (existing cases for loginUser, registerUser, verifyAccount, loadUserFromStorage)

      // Forgot Password Thunk handling
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null; // Successfully requested reset code
        // The code itself is usually not kept in Redux state, as it's for one-time use via email.
        // If you saved it to SecureStore, it's independent of Redux state here.
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to request password reset.';
      })
      // Reset Password Thunk handling
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null; // Successfully reset password
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reset password.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
```

**Important Note on `forgotPassword` (`data.data.token.code`):**
In a real-world scenario, the `forgot-password` endpoint typically *sends* the reset code to the user's email, rather than *returning* it directly in the API response to the client. If your backend is returning it for development convenience, the `SecureStore.setItemAsync('resetCode', data.data.token.code)` line will store it. For production, you'd likely remove that and rely solely on the user manually inputting the code from their email. The current code correctly handles the case where it *is* returned.

---

### Step 3: Refactor `app/auth/forgot.tsx`

```typescript
// app/auth/forgot.tsx (updated content)

import React, { useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { forgotPassword, clearAuthError } from "@/redux/slices/authSlice"; // Import the thunk
import { AppDispatch, RootState } from "@/redux/store"; // Import types

interface ForgotValues {
  email: string;
}

const ForgotPasswordScreen = () => { // Renamed for clarity
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use Redux state

  useEffect(() => {
    // Clear any previous authentication errors when component mounts
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: ForgotValues = {
    email: "",
  };

  const validationSchema = yup.object({ // Renamed from signupSchema for clarity
    email: yup
      .string()
      .trim(t("forgotPassword.yup.email.trim"))
      .email(t("forgotPassword.yup.email.email"))
      .required(t("forgotPassword.yup.email.required")),
  });

  const handleSubmit = async (
    values: ForgotValues,
    actions: FormikHelpers<ForgotValues>
  ) => {
    const resultAction = await dispatch(forgotPassword(values));

    if (forgotPassword.fulfilled.match(resultAction)) {
      // On success, navigate to the reset password screen
      // Optionally show a success message (e.g., "Reset code sent to your email")
      router.push("/auth/reset");
    }
    // Errors are handled by Redux state and displayed in the UI.
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h2" style={styles.title}>
        {t("forgotPassword.title")}
      </CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              label={t("forgotPassword.emailLabel")}
              containerStyle={styles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error && <Text style={styles.errorText}>{error}</Text>} {/* Display Redux error */}
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("forgotPassword.submitButton")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("forgotPassword.loadingText")}
              containerStyle={styles.appButton}
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  appButton: {
    width: "100%",
    marginTop: 10,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
});
```

---

### Step 4: Refactor `app/auth/reset.tsx`

```typescript
// app/auth/reset.tsx (updated content)

import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from 'expo-secure-store'; // Import SecureStore for the reset code

import {
  AppButton,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { resetPassword, clearAuthError } from "@/redux/slices/authSlice"; // Import the thunk
import { AppDispatch, RootState } from "@/redux/store"; // Import types

interface ResetValues {
  password: string;
  confirmPassword: string;
  code: string;
  email: string;
}

const ResetPasswordScreen = () => { // Renamed for clarity
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true); // Default to true
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use Redux state
  const [localErrorMessage, setLocalErrorMessage] = useState(""); // For client-side validation errors not from Redux (e.g., code mismatch)

  useEffect(() => {
    dispatch(clearAuthError()); // Clear any previous Redux errors
    setLocalErrorMessage(""); // Clear local errors
    // Optionally pre-fill email if it was passed from the forgot screen,
    // or auto-fill code if saved for dev purposes.
  }, [dispatch]);

  const initialValues: ResetValues = {
    password: "",
    confirmPassword: "",
    code: "",
    email: "",
  };

  const resetSchema = yup.object({
    password: yup
      .string()
      .trim(t("reset.yup.password.trim"))
      .min(8, t("reset.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("reset.yup.password.matches")
      )
      .required(t("reset.yup.password.required")),
    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("reset.yup.confirmPassword.oneOf")
      )
      .required(t("reset.yup.confirmPassword.required")),
    code: yup
      .string()
      .matches(/^[A-Z0-9]{6}$/, t("reset.yup.code.matches"))
      .required(t("reset.yup.code.required")),
    email: yup
      .string()
      .trim(t("reset.yup.email.trim"))
      .email(t("reset.yup.email.email"))
      .required(t("reset.yup.email.required")),
  });

  const handleSubmit = async (
    values: ResetValues,
    actions: FormikHelpers<ResetValues>
  ) => {
    setLocalErrorMessage(""); // Clear previous local error before new submission

    // Retrieve the code from SecureStore (if saved for dev/testing)
    const storedCode = await SecureStore.getItemAsync("resetCode");

    if (storedCode && storedCode !== values.code) {
      setLocalErrorMessage(t("reset.error.incorrectCode")); // Use translation key
      return;
    }

    const resultAction = await dispatch(resetPassword(values));

    if (resetPassword.fulfilled.match(resultAction)) {
      // Password reset successfully, navigate to login
      // Optionally show a success message
      router.push("/auth/login");
    }
    // Errors are handled by Redux state or localErrorMessage and displayed in the UI.
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1" style={styles.title}> {/* Changed to h1, adjusted style */}
        {t("reset.title")}
      </CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="code"
              placeholder={t("reset.form.placeholder1")}
              label={t("reset.form.label1")}
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="email"
              placeholder={t("reset.form.placeholder2")}
              label={t("reset.form.label2")}
              containerStyle={styles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInputField
              name="password"
              placeholder={t("reset.form.placeholder3")}
              label={t("reset.form.label3")}
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <AuthInputField
              name="confirmPassword"
              placeholder={t("reset.form.placeholder4")}
              label={t("reset.form.label4")}
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry} // Use the same secureTextEntry state
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            {(error || localErrorMessage) ? (
              <Text style={styles.errorText}>{error || localErrorMessage}</Text>
            ) : null}
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("reset.button")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("reset.loading")}
              containerStyle={styles.appButton}
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  appButton: {
    width: "100%",
    marginTop: 10,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 10,
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
});
```

---

**Important Notes:**

1.  **Translation Keys:** I've added placeholder translation keys like `forgotPassword.yup.email.trim`, `reset.yup.password.min`, etc. You'll need to define these in your `i18n` translation files for them to display correctly.
2.  **`SecureStore.deleteItemAsync('resetCode')`:** In `resetPassword` thunk, I've added a line to delete the `resetCode` from `SecureStore` after a successful password reset. This is good practice to clean up sensitive, single-use data.
3.  **`secureTextEntry` State in `reset.tsx`:** Both password fields in `reset.tsx` (`password` and `confirmPassword`) should ideally share a single `secureTextEntry` state, which is what I've done. This way, toggling visibility affects both fields simultaneously.
4.  **Error Display in `reset.tsx`:** I've modified the error display to show either the Redux `error` or the `localErrorMessage` (for client-side issues like an incorrect stored code).
5.  **`CustomText` type `larger`:** In `reset.tsx`, I noticed `CustomText type="larger"`. Ensure your `CustomText` component supports this type, or adjust it to `h1`, `h2`, etc., as per your component's definition. I've changed it to `h1` in the updated code for consistency.
6.  **`AuthInputField` styling:** I've made sure that `containerStyle` passed to `AuthInputField` includes `width: "100%"` to ensure they stretch properly within their parent `View`. The `AuthInputField` itself also has `width:"100%"`.

Now your entire authentication flow, including password reset, is integrated with Redux Toolkit for efficient state management and a cleaner separation of concerns.

Let me know if you have any questions or are ready to move to Phase 2: User Profiles & Core Content Feed!