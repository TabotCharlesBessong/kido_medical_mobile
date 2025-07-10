Okay, this is a crucial step! Integrating the doctor registration process and the admin KYC verification requires updating our Redux slices and creating new UI components. This will involve:

1.  **Doctor Profile Creation:** A regular user (initially a `PATIENT` or unassigned role) can submit their doctor-specific details. This will trigger a KYC process on the backend.
2.  **Admin KYC Verification:** An admin user will be able to view pending doctor KYC requests and approve/reject them.

Let's break down the implementation.

---

### Step 1: Define New Types

Create a new file `src/types/doctor.ts` (or add to an existing `types` directory) to house types related to doctor profiles. We'll also update `src/types/admin.ts` for KYC.

```typescript
// src/types/doctor.ts
// This file will hold types specific to doctors

export interface DoctorProfile {
  id: string; // The ID of the doctor's profile (distinct from userId in some schemas)
  userId: string; // The ID of the associated user account
  specialization: string;
  fee: number;
  documents: string; // URL to professional documents (e.g., license, certificates)
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'; // Status of KYC verification
  // Add any other doctor-specific fields your backend returns
  createdAt: string;
  updatedAt: string;
}

// Payload for creating a new doctor profile
export interface CreateDoctorProfilePayload {
  specialization: string;
  fee: number; // Assuming backend expects a number
  documents: string; // URL of the uploaded document
}

// API response structure for creating/fetching a doctor profile
export interface DoctorProfileApiResponse {
  success: boolean;
  message: string;
  data?: DoctorProfile; // `data` field might contain the DoctorProfile on success
}
```

```typescript
// src/types/admin.ts
// This file will hold types specific to admin actions, including KYC

import { User } from './auth'; // Assuming User interface is in auth.ts
import { DoctorProfile } from './doctor'; // Import DoctorProfile for linked data

export interface KycVerification {
  id: string; // Unique ID for the KYC verification record
  userId: string; // ID of the user whose KYC is being verified
  user: User; // Full user details associated with this KYC
  type: 'DOCTOR_PROFILE' | 'IDENTITY'; // Type of verification (e.g., for doctor roles or general identity)
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Current status of the verification
  documents: string[]; // Array of URLs to submitted documents
  notes?: string; // Optional notes from the admin
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfile; // Optional: If type is DOCTOR_PROFILE, link to the doctor's profile
}

// API response for fetching a list of KYC verifications
export interface FetchKycVerificationsApiResponse {
  success: boolean;
  message: string;
  data: KycVerification[]; // Array of pending KYC requests
}

// Payload for verifying a doctor's profile (used by admin)
export interface VerifyDoctorPayload {
  email: string; // Doctor's email as used in Postman
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

// Payload for general KYC verification (if applicable, separate from doctor specific)
export interface VerifyKycPayload {
  userId: string; // User ID to verify
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

// Generic API response for admin actions (e.g., approve/reject)
export interface AdminActionApiResponse {
  success: boolean;
  message: string;
}
```

---

### Step 2: Create Redux Slices

We'll need two new slices: `doctorProfileSlice` for the doctor's own profile management, and `adminSlice` for admin-specific actions like KYC.

**2.1. `src/redux/slices/doctorProfileSlice.ts`**

This slice will manage the doctor's profile state and the API calls to create/fetch it.

```typescript
// src/redux/slices/doctorProfileSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance'; // Our configured Axios instance
import { DoctorProfile, CreateDoctorProfilePayload, DoctorProfileApiResponse } from '@/types/doctor';

interface DoctorProfileState {
  profile: DoctorProfile | null; // Stores the current doctor's profile
  isLoading: boolean;
  error: string | null;
}

const initialState: DoctorProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Async Thunk for creating/completing a doctor profile
export const createDoctorProfile = createAsyncThunk<DoctorProfileApiResponse, CreateDoctorProfilePayload, { rejectValue: string }>(
  'doctor/createProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<DoctorProfileApiResponse>('/doctor/create', profileData);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to create doctor profile. Please check your data.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for fetching a specific doctor's profile (can be used by patient or doctor themselves)
export const fetchDoctorProfileById = createAsyncThunk<DoctorProfileApiResponse, string, { rejectValue: string }>(
  'doctor/fetchProfileById',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<DoctorProfileApiResponse>(`/doctor/${doctorId}`);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Doctor profile not found.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

const doctorProfileSlice = createSlice({
  name: 'doctorProfile',
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
    }
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
        state.error = action.payload || 'Failed to create doctor profile.';
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
        state.error = action.payload || 'Failed to fetch doctor profile.';
      });
  },
});

export const { clearDoctorProfileError, setDoctorProfile } = doctorProfileSlice.actions;
export default doctorProfileSlice.reducer;
```

**2.2. `src/redux/slices/adminSlice.ts`**

This slice will handle fetching pending KYC requests and performing approval/rejection actions.

```typescript
// src/redux/slices/adminSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';
import {
  KycVerification,
  FetchKycVerificationsApiResponse,
  VerifyDoctorPayload,
  VerifyKycPayload,
  AdminActionApiResponse
} from '@/types/admin'; // Make sure to import correct types

interface AdminState {
  pendingKyc: KycVerification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  pendingKyc: [],
  isLoading: false,
  error: null,
};

// Async Thunk for fetching pending KYC verifications
export const fetchPendingKycVerifications = createAsyncThunk<FetchKycVerificationsApiResponse, void, { rejectValue: string }>(
  'admin/fetchPendingKyc',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<FetchKycVerificationsApiResponse>('/admin/kyc-verifications/pending');
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch pending KYC verifications.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for verifying a doctor's profile via email
export const verifyDoctorProfile = createAsyncThunk<AdminActionApiResponse, VerifyDoctorPayload, { rejectValue: string }>(
  'admin/verifyDoctorProfile',
  async (verificationData, { rejectWithValue }) => {
    try {
      // Backend expects email as query param: /api/admin/doctor-verifications/verify?email=abc@example.com
      const response = await axiosInstance.post<AdminActionApiResponse>(
        `/admin/doctor-verifications/verify?email=${verificationData.email}`,
        { status: verificationData.status, notes: verificationData.notes }
      );
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to verify doctor profile.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for general KYC verification (if different from doctor, using userId in path)
export const verifyKyc = createAsyncThunk<AdminActionApiResponse, VerifyKycPayload, { rejectValue: string }>(
  'admin/verifyKyc',
  async (verificationData, { rejectWithValue }) => {
    try {
      // Backend expects userId in path: /api/admin/kyc-verifications/:userId/verify
      const response = await axiosInstance.patch<AdminActionApiResponse>(
        `/admin/kyc-verifications/${verificationData.userId}/verify`,
        { status: verificationData.status, notes: verificationData.notes }
      );
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to verify KYC.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    // Action to remove a KYC request from the pending list after it's processed
    removeKycFromPending: (state, action: PayloadAction<string>) => {
      state.pendingKyc = state.pendingKyc.filter(kyc => kyc.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPendingKycVerifications
      .addCase(fetchPendingKycVerifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingKycVerifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingKyc = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPendingKycVerifications.rejected, (state, action) => {
        state.isLoading = false;
        state.pendingKyc = []; // Clear list on error
        state.error = action.payload || 'Failed to load pending KYC requests.';
      })
      // Handle verifyDoctorProfile
      .addCase(verifyDoctorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyDoctorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The `removeKycFromPending` action will be dispatched manually from the component
      })
      .addCase(verifyDoctorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to verify doctor profile.';
      })
      // Handle verifyKyc (general)
      .addCase(verifyKyc.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyKyc.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The `removeKycFromPending` action will be dispatched manually from the component
      })
      .addCase(verifyKyc.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to verify KYC.';
      });
  },
});

export const { clearAdminError, removeKycFromPending } = adminSlice.actions;
export default adminSlice.reducer;
```

---

### Step 3: Update Redux Store Configuration

Add the new reducers to your `src/redux/store.ts`.

```typescript
// src/redux/store.ts (updated content)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorProfileReducer from './slices/doctorProfileSlice'; // New import
import adminReducer from './slices/adminSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorProfile: doctorProfileReducer, // Add this line
    admin: adminReducer, // Add this line
    // ... other reducers as you create them (e.g., patientProfile, posts)
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Step 4: Create UI Components

**4.1. Doctor Profile Creation Screen (`app/(tabs)/profile/create-doctor.tsx`)**

This screen will allow a user to submit their doctor details for verification. Assuming you have a "profile" tab where a user might initiate this.

```typescript
// app/(tabs)/profile/create-doctor.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Text, ScrollView, Alert, Platform } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker'; // You'll need to install this: `expo install @react-native-picker/picker`
import * as ImagePicker from 'expo-image-picker'; // You'll need to install this: `expo install expo-image-picker`

import { AppButton, AuthInputField, CustomText } from '@/components';
import { COLORS } from '@/constants/theme';
import { createDoctorProfile, clearDoctorProfileError } from '@/redux/slices/doctorProfileSlice';
import { AppDispatch, RootState } from '@/redux/store';

interface DoctorProfileValues {
  specialization: string;
  fee: string; // Keep as string for form input, convert to number before dispatch
  documents: string; // Will store the URI or URL after picking/uploading
}

const CreateDoctorProfileScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.doctorProfile);

  const [pickedDocumentUri, setPickedDocumentUri] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearDoctorProfileError()); // Clear errors on component mount
  }, [dispatch]);

  const initialValues: DoctorProfileValues = {
    specialization: '',
    fee: '',
    documents: '',
  };

  const validationSchema = yup.object({
    specialization: yup.string().required(t('doctorProfile.specializationRequired')),
    fee: yup.string()
      .required(t('doctorProfile.feeRequired'))
      .matches(/^[0-9]+(\.[0-9]{1,2})?$/, t('doctorProfile.feeInvalid')), // Allows integers or decimals with 1-2 places
    documents: yup.string().required(t('doctorProfile.documentsRequired')), // Requires a document URI/URL
  });

  const pickDocument = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to upload documents.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Or .All to allow PDFs too if backend supports
      allowsEditing: false,
      quality: 1,
      // base64: true, // Only if your backend expects base64 directly
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPickedDocumentUri(uri);
      setFieldValue('documents', uri, true); // Set formik field value and validate

      // In a real application, you'd perform the actual file upload to your backend
      // or a cloud storage (e.g., Cloudinary, AWS S3).
      // This upload would return a public URL, which you'd then use in the `documents` field.
      // For now, we're just storing the local URI.
      // Example of what a real upload might look like (pseudo-code):
      /*
      try {
        const uploadedUrl = await uploadFileToCloud(uri); // Your custom upload function
        setFieldValue('documents', uploadedUrl, true);
      } catch (uploadError) {
        Alert.alert('Upload Failed', 'Could not upload document.');
        setFieldValue('documents', '', true); // Clear field on upload failure
      }
      */
    }
  };

  const handleSubmit = async (
    values: DoctorProfileValues,
    actions: FormikHelpers<DoctorProfileValues>
  ) => {
    if (!pickedDocumentUri) {
      Alert.alert('Document Missing', 'Please upload your professional documents (e.g., medical license, certificates).');
      return;
    }

    // Convert fee string to number
    const feeAsNumber = parseFloat(values.fee);

    // Dispatch the thunk with the data
    const resultAction = await dispatch(createDoctorProfile({
      specialization: values.specialization,
      fee: feeAsNumber,
      documents: pickedDocumentUri, // This should be the actual URL from a file upload service
    }));

    if (createDoctorProfile.fulfilled.match(resultAction)) {
      Alert.alert(t('common.success'), t('doctorProfile.submissionSuccess'));
      // You might navigate to a "Pending Verification" screen or home
      router.replace('/(tabs)/');
    }
    // Errors are handled by Redux state and displayed in the UI
  };

  // Dummy specializations for the Picker
  const specializations = [
    { label: t('doctorProfile.selectSpecialization'), value: '' },
    { label: t('doctorProfile.gp'), value: 'General Practitioner' },
    { label: t('doctorProfile.pediatrician'), value: 'Pediatrician' },
    { label: t('doctorProfile.cardiologist'), value: 'Cardiologist' },
    { label: t('doctorProfile.dermatologist'), value: 'Dermatologist' },
    { label: t('doctorProfile.gynecologist'), value: 'Gynecologist' },
    { label: t('doctorProfile.neurologist'), value: 'Neurologist' },
    { label: t('doctorProfile.orthopedist'), value: 'Orthopedist' },
    { label: t('doctorProfile.psychiatrist'), value: 'Psychiatrist' },
    { label: t('doctorProfile.oncologist'), value: 'Oncologist' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>
          {t('doctorProfile.title')}
        </CustomText>
        <CustomText type="body2" style={styles.subtitle}>
          {t('doctorProfile.subtitle')}
        </CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Specialization Picker */}
              <View style={styles.pickerContainer}>
                <CustomText type="body4" style={styles.pickerLabel}>
                  {t('doctorProfile.specializationLabel')}
                </CustomText>
                <Picker
                  selectedValue={values.specialization}
                  onValueChange={(itemValue) => setFieldValue('specialization', itemValue)}
                  style={styles.picker}
                >
                  {specializations.map((item, index) => (
                    <Picker.Item key={index} label={item.label} value={item.value} />
                  ))}
                </Picker>
                {touched.specialization && errors.specialization && (
                  <Text style={styles.errorText}>{errors.specialization}</Text>
                )}
              </View>

              <AuthInputField
                name="fee"
                label={t('doctorProfile.feeLabel')}
                placeholder={t('doctorProfile.feePlaceholder')}
                keyboardType="numeric"
                containerStyle={styles.inputField}
              />

              {/* Document Upload */}
              <View style={styles.documentUploadContainer}>
                <AppButton
                  title={t('doctorProfile.uploadDocumentsButton')}
                  onPress={() => pickDocument(setFieldValue)}
                  backgroundColor={COLORS.lightGray}
                  textColor={COLORS.dark}
                  containerStyle={styles.uploadButton}
                />
                {pickedDocumentUri ? (
                  <Text style={styles.documentUriText}>
                    {t('doctorProfile.documentSelected')}: {pickedDocumentUri.split('/').pop()}
                  </Text>
                ) : (
                  touched.documents && errors.documents && (
                    <Text style={styles.errorText}>{errors.documents}</Text>
                  )
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t('doctorProfile.submitButton')}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t('doctorProfile.loading')}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateDoctorProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.gray,
  },
  form: {
    width: '100%',
    maxWidth: 450, // Max width for tablet views
    alignItems: 'center',
  },
  inputField: {
    marginBottom: 15,
    width: '100%',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background, // A lighter background for the picker
  },
  pickerLabel: {
    paddingLeft: 10,
    paddingTop: 8,
    color: COLORS.dark, // A clear color for the label
  },
  picker: {
    width: '100%',
    height: 50,
    color: COLORS.text, // Text color inside the picker
  },
  documentUploadContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadButton: {
    width: '80%',
    marginBottom: 10,
  },
  documentUriText: {
    marginTop: 5,
    color: COLORS.success,
    textAlign: 'center',
    fontSize: 12,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
    fontSize: 12,
  },
  submitButton: {
    width: '100%',
    marginTop: 20,
  },
});
```

**4.2. Admin KYC List Screen (`app/(tabs)/admin/kyc-list.tsx`)**

This screen will be accessible only to admin users and will list pending KYC requests.

```typescript
// app/(tabs)/admin/kyc-list.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  fetchPendingKycVerifications,
  verifyDoctorProfile, // Specific thunk for doctor verification
  // verifyKyc, // General KYC thunk if needed for other types of KYC
  removeKycFromPending,
  clearAdminError
} from '@/redux/slices/adminSlice';
import { KycVerification } from '@/types/admin';
import { AppButton, CustomText } from '@/components';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser'; // For opening document URLs

const AdminKycListScreen = () => {
  const dispatch: AppDispatch = useDispatch();
  const { pendingKyc, isLoading, error } = useSelector((state: RootState) => state.admin);
  const user = useSelector((state: RootState) => state.auth.user); // Get current user for role check

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch and role check
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      Alert.alert('Access Denied', 'You do not have permission to view this page.');
      router.replace('/(tabs)/'); // Redirect non-admins
      return;
    }
    dispatch(fetchPendingKycVerifications());
  }, [dispatch, user, router]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPendingKycVerifications());
    setRefreshing(false);
  }, [dispatch]);

  const handleVerify = async (kycId: string, userEmail: string, status: 'APPROVED' | 'REJECTED') => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${status.toLowerCase()} this doctor's verification?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            // Use verifyDoctorProfile specifically
            const resultAction = await dispatch(verifyDoctorProfile({
              email: userEmail,
              status: status,
              notes: `Admin ${status.toLowerCase()} verification at ${new Date().toLocaleString()}`
            }));

            if (verifyDoctorProfile.fulfilled.match(resultAction)) {
              Alert.alert('Success', `Doctor verification ${status.toLowerCase()} successfully.`);
              dispatch(removeKycFromPending(kycId)); // Remove from list immediately
            }
          },
        },
      ]
    );
  };

  const openDocument = async (url: string) => {
    if (url) {
      const result = await WebBrowser.openBrowserAsync(url);
      if (result.type === 'cancel') {
        Alert.alert('Action Cancelled', 'Document view was cancelled.');
      }
    } else {
      Alert.alert('No Document', 'No document URL available for this request.');
    }
  };

  const renderItem = ({ item }: { item: KycVerification }) => (
    <View style={styles.kycCard}>
      <CustomText type="h4" style={styles.cardHeader}>{item.type} Verification Request</CustomText>
      <CustomText type="body4">
        User: {item.user.firstname} {item.user.lastname} ({item.user.email})
      </CustomText>
      {item.doctorProfile && (
        <CustomText type="body4">
          Specialization: {item.doctorProfile.specialization}, Fee: ${item.doctorProfile.fee}
        </CustomText>
      )}
      <CustomText type="body4">Status: <Text style={{ color: item.status === 'PENDING' ? COLORS.warning : COLORS.gray }}>{item.status}</Text></CustomText>
      <CustomText type="body4">Request Date: {new Date(item.createdAt).toLocaleDateString()}</CustomText>

      {item.documents && item.documents.length > 0 && (
        <AppButton
          title={`View Document${item.documents.length > 1 ? 's' : ''}`}
          onPress={() => openDocument(item.documents[0])} // Assuming one primary document or pick first
          backgroundColor={COLORS.secondary}
          textColor={COLORS.dark}
          containerStyle={styles.viewDocButton}
          titleStyle={styles.viewDocButtonTitle}
        />
      )}

      {item.status === 'PENDING' && (
        <View style={styles.buttonContainer}>
          <AppButton
            title="Approve"
            onPress={() => handleVerify(item.id, item.user.email, 'APPROVED')}
            backgroundColor={COLORS.success}
            containerStyle={styles.actionButton}
            loading={isLoading}
          />
          <AppButton
            title="Reject"
            onPress={() => handleVerify(item.id, item.user.email, 'REJECTED')}
            backgroundColor={COLORS.danger}
            containerStyle={styles.actionButton}
            loading={isLoading}
          />
        </View>
      )}
    </View>
  );

  if (isLoading && pendingKyc.length === 0 && !error) { // Only show full loading indicator if no data and no error
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading pending verifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>Pending KYC Verifications</CustomText>
      {pendingKyc.length === 0 && !isLoading ? ( // Show empty message only if not loading and no items
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>No pending KYC requests found.</CustomText>
          <AppButton
            title="Refresh"
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: '50%' }}
          />
        </View>
      ) : (
        <FlatList
          data={pendingKyc}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
};

export default AdminKycListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F7F7F7', // Assuming a background color from COLORS
    paddingTop: 50, // Adjust for status bar/notch
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text || '#333',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  kycCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
    color: COLORS.dark || '#333',
  },
  viewDocButton: {
    marginTop: 10,
    width: '60%', // narrower button
    alignSelf: 'center',
    height: 35, // smaller height
    borderRadius: 18,
    backgroundColor: COLORS.info || '#007BFF',
  },
  viewDocButtonTitle: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    width: '45%',
    height: 40,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray || '#666',
    textAlign: 'center',
  },
});
```

---

### Step 5: Update Root Navigation (`app/(tabs)/_layout.tsx`)

Ensure proper navigation setup for the new screens, especially for admin access.

```typescript
// app/(tabs)/_layout.tsx (updated to include admin tab)

import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import React from 'react'; // Make sure React is imported

export default function TabLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  // Add a way to check if doctor profile exists and is approved, if needed for routing
  // const doctorProfile = useSelector((state: RootState) => state.doctorProfile.profile);

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR'; // Assuming 'DOCTOR' role is set after verification
  const isPatient = user?.role === 'PATIENT'; // Default role, or after patient profile setup

  return (
    <Tabs>
      <Tabs.Screen
        name="index" // Home/Feed screen
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: false,
        }}
      />
      {/* Example: Messages tab - visible for all */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
          headerShown: false,
        }}
      />

      {/* Doctor-specific tabs */}
      {isDoctor && (
        <>
          <Tabs.Screen
            name="doctor/my-appointments" // Example, assuming a doctor specific appointments list
            options={{
              title: 'My Schedule',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-check-o" color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="doctor/my-patients" // Example, for viewing patient records etc.
            options={{
              title: 'My Patients',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="group" color={color} />,
              headerShown: false,
            }}
          />
        </>
      )}

      {/* Patient-specific tabs */}
      {isPatient && (
        <>
          <Tabs.Screen
            name="book-appointment" // Example, for booking appointments
            options={{
              title: 'Book',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-plus-o" color={color} />,
              headerShown: false,
            }}
          />
          {/* Add more patient specific tabs here */}
        </>
      )}

      {/* Admin-specific tab */}
      {isAdmin && (
        <Tabs.Screen
          name="admin/kyc-list" // Path to your Admin KYC screen
          options={{
            title: 'Admin KYC',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="gavel" color={color} />, // Judge's gavel icon
            headerShown: false,
          }}
        />
      )}

      <Tabs.Screen
        name="profile" // User's general profile, where "Become a Doctor" might be
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
```

---

### Key Considerations Before Running:

1.  **Dependencies:** Ensure you have installed `@react-native-picker/picker` and `expo-image-picker`:
    ```bash
    npm install @react-native-picker/picker expo-image-picker
    # Or if using Expo Go:
    expo install @react-native-picker/picker expo-image-picker
    ```
    Also `expo install expo-web-browser` for the admin screen.

2.  **`app.json` Permissions (for `expo-image-picker`):**
    For Android and iOS, add the necessary permissions to your `app.json`:
    ```json
    {
      "expo": {
        "android": {
          "permissions": ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "CAMERA"]
        },
        "ios": {
          "infoPlist": {
            "NSPhotoLibraryUsageDescription": "Allow $(PRODUCT_NAME) to access your photos for document uploads.",
            "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera for document uploads."
          }
        }
      }
    }
    ```
    Rebuild your dev client or standalone app if you change `app.json`.

3.  **Backend Logic for Role Update:**
    *   **Doctor Creation:** Your `POST /api/doctor/create` endpoint *must* be designed to handle the user's role. Typically, when a user creates a doctor profile, their `User` record's `role` field would be updated (e.g., from `PATIENT` to `APPLICANT_DOCTOR` or a `verificationStatus` added).
    *   **Admin Verification:** When `POST /api/admin/doctor-verifications/verify` is called with `status: "APPROVED"`, the backend should change the corresponding `User`'s role to `"DOCTOR"`. This change is critical for the `isDoctor` check in the frontend to work correctly. The frontend might need to re-fetch the user's data (e.g., call `loadUserFromStorage` again or have a specific `fetchCurrentUserProfile` thunk) after an admin action to reflect the role change without requiring a full re-login.

4.  **Actual Document Upload:** The `CreateDoctorProfileScreen` currently just takes the local URI of the picked document. **For a production app, you absolutely need to implement actual file upload to a cloud storage service (e.g., Cloudinary, AWS S3, Google Cloud Storage, Firebase Storage)**. Your backend would then store the *public URL* of this uploaded document. The current code passes the local `pickedDocumentUri` which will likely fail the backend validation if it expects a public URL.

5.  **Role Handling:** The `_layout.tsx` uses `user?.role`. Ensure that when a user first registers, their default `role` is something like `PATIENT` (or `USER`), and it changes to `DOCTOR` *only after* admin approval. If the backend doesn't automatically send updated user data after admin approval, the doctor user will only see the role change after their next login (when `loadUserFromStorage` runs again). You might need a mechanism to `dispatch(loadUserFromStorage())` or a similar action after a doctor knows their profile is approved.

6.  **Translation Keys:** Remember to add all new translation keys (`doctorProfile.title`, `doctorProfile.specializationRequired`, `admin.accessDenied`, etc.) to your `i18n` configuration.

With these steps, you'll have robust Redux-managed flows for doctor profile creation and admin KYC verification.