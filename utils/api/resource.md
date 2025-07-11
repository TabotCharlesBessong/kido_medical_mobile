You're absolutely right to point that out! My apologies for jumping ahead. It's crucial to maintain the correct phase order for a smooth development process.

Let's correct the roadmap and focus on "Phase 3: User Profile Completion (Patient & Doctor)". This phase will ensure that all users can set up and view their detailed profiles based on their role.

We already have the Redux setup and basic authentication components. Now, we'll build upon that.

---

### Phase 3: User Profile Completion (Patient & Doctor)

**Goal:** Enable all authenticated users to complete their specific profile details (Patient or Doctor) and manage their profile information.

**Key Components & Logic:**

1.  **Patient Profile Creation:** A new screen and Redux slice for collecting patient-specific demographic data.
2.  **Doctor Profile Creation:** The `CreateDoctorProfileScreen` we already drafted, now fully integrated with Redux and the proper flow.
3.  **General Profile View:** A common screen where the current authenticated user can view and potentially edit their basic user information, and conditionally display/edit their patient or doctor profile.
4.  **Conditional Redirection:** Logic to direct newly registered users (or users without a complete profile) to the appropriate profile creation screen immediately after login.
5.  **Role Update Mechanism:** Ensuring that once a doctor's profile is created and verified by an admin, their `User` role in the `authSlice` is updated. This usually involves the backend sending updated user data upon successful verification, which we then dispatch to update the Redux state.

---

### Step 1: Update `types/auth.ts` and Create `types/patient.ts`

**1.1. Update `src/types/auth.ts`**
Let's enhance the `User` interface to include optional IDs for their associated patient or doctor profile, which will be useful for linking:

```typescript
// src/types/auth.ts (Updated User interface)

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'UNVERIFIED' | 'PENDING_DOCTOR'; // Refined roles
  isVerified?: boolean; // For email verification
  // New fields for linking to profiles
  patientProfileId?: string | null; // ID of the associated patient profile
  doctorProfileId?: string | null; // ID of the associated doctor profile
}

// ... (rest of your existing auth types)
```

**1.2. Create `src/types/patient.ts`**
This file will hold types specific to patient profiles.

```typescript
// src/types/patient.ts

export interface PatientProfile {
  id: string; // ID of the patient's profile
  userId: string; // The ID of the associated user account
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  address1: string;
  address2?: string; // Optional
  occupation?: string; // Optional
  phoneNumber: string;
  tribe?: string; // Optional
  religion?: string; // Optional
  createdAt: string;
  updatedAt: string;
  // Add any other patient-specific fields your backend returns
}

// Payload for creating a new patient profile
export interface CreatePatientProfilePayload {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  address1: string;
  address2?: string;
  occupation?: string;
  phoneNumber: string;
  tribe?: string;
  religion?: string;
}

// API response structure for creating/fetching a patient profile
export interface PatientProfileApiResponse {
  success: boolean;
  message: string;
  data?: PatientProfile; // `data` field might contain the PatientProfile on success
}
```

---

### Step 2: Create `src/redux/slices/patientProfileSlice.ts`

This new slice will manage the patient's profile state and the API calls to create/fetch/update it.

```typescript
// src/redux/slices/patientProfileSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';
import { PatientProfile, CreatePatientProfilePayload, PatientProfileApiResponse } from '@/types/patient';

interface PatientProfileState {
  profile: PatientProfile | null; // Stores the current patient's profile
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Async Thunk for creating/completing a patient profile
export const createPatientProfile = createAsyncThunk<PatientProfileApiResponse, CreatePatientProfilePayload, { rejectValue: string }>(
  'patient/createProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PatientProfileApiResponse>('/patient/create', profileData);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to create patient profile. Please check your data.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for fetching the current patient's profile
// This assumes an endpoint like /api/patient/me that uses the JWT token to identify the user
// If not, you'd need the patient ID (e.g., from auth.user.patientProfileId)
export const fetchPatientProfile = createAsyncThunk<PatientProfileApiResponse, string | void, { rejectValue: string }>(
  'patient/fetchProfile',
  async (patientId, { rejectWithValue, getState }) => {
    try {
      // Option 1: If backend has a /me endpoint (preferred)
      // const response = await axiosInstance.get<PatientProfileApiResponse>('/patient/me');
      
      // Option 2: If we pass the patientId (e.g., from auth.user.patientProfileId)
      const userId = (getState() as any).auth.user?.id; // Get current user ID from auth slice
      if (!userId && !patientId) {
        return rejectWithValue('User ID or Patient ID not available for fetching profile.');
      }
      const idToFetch = patientId || userId; // Use patientId if provided, else current userId (assuming patientId is same as userId or available from auth.user)

      // Postman had GET /api/patient/appointments, not a direct profile get for patient.
      // Let's assume a GET /api/patient/profile endpoint or if patientId is their userId
      // For now, I'll use /api/patient/:userId, assuming the backend can return the full patient profile if userId is used.
      // You might need to confirm your backend's actual endpoint for fetching the CURRENT patient's profile.
      const response = await axiosInstance.get<PatientProfileApiResponse>(`/patient/${idToFetch}`);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Patient profile not found.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for updating a patient profile
export interface UpdatePatientProfilePayload extends Partial<CreatePatientProfilePayload> {
  // Can be partial as not all fields need to be updated
}

export const updatePatientProfile = createAsyncThunk<PatientProfileApiResponse, UpdatePatientProfilePayload, { rejectValue: string }>(
  'patient/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const currentProfileId = (getState() as any).patientProfile.profile?.id;
      if (!currentProfileId) {
        return rejectWithValue('Patient profile ID not available for update.');
      }
      // Convert age/fee to number if present and needed
      const dataToSend = {
        ...profileData,
        age: profileData.age ? Number(profileData.age) : undefined,
      };

      const response = await axiosInstance.put<PatientProfileApiResponse>(`/patient/${currentProfileId}`, dataToSend);
      const data = response.data;

      if (data.success && data.data) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to update patient profile.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);


const patientProfileSlice = createSlice({
  name: 'patientProfile',
  initialState,
  reducers: {
    clearPatientProfileError: (state) => {
      state.error = null;
    },
    setPatientProfile: (state, action: PayloadAction<PatientProfile | null>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle createPatientProfile
      .addCase(createPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null;
        state.error = null;
      })
      .addCase(createPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to create patient profile.';
      })
      // Handle fetchPatientProfile
      .addCase(fetchPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to fetch patient profile.';
      })
      // Handle updatePatientProfile
      .addCase(updatePatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data || null; // Update with the latest data
        state.error = null;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update patient profile.';
      });
  },
});

export const { clearPatientProfileError, setPatientProfile } = patientProfileSlice.actions;
export default patientProfileSlice.reducer;
```

---

### Step 3: Update `src/redux/store.ts`

Add the new `patientProfileReducer` to your store.

```typescript
// src/redux/store.ts (updated content)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorProfileReducer from './slices/doctorProfileSlice';
import adminReducer from './slices/adminSlice';
import patientProfileReducer from './slices/patientProfileSlice'; // New import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorProfile: doctorProfileReducer,
    admin: adminReducer,
    patientProfile: patientProfileReducer, // Add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Step 4: Create UI Components for Profile Completion

**4.1. Patient Profile Creation Screen (`app/(tabs)/profile/create-patient.tsx`)**

This screen will guide new patients to complete their profile.

```typescript
// app/(tabs)/profile/create-patient.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Text, ScrollView, Platform, Alert } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';

import { AppButton, AuthInputField, CustomText } from '@/components';
import { COLORS } from '@/constants/theme';
import { createPatientProfile, clearPatientProfileError } from '@/redux/slices/patientProfileSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { setAuthUser } from '@/redux/slices/authSlice'; // Import to update user role/profile ID in auth state

interface PatientProfileValues {
  gender: 'MALE' | 'FEMALE' | 'OTHER' | ''; // Add empty string for initial state in picker
  age: string; // Keep as string for form input, convert to number
  address1: string;
  address2: string;
  occupation: string;
  phoneNumber: string;
  tribe: string;
  religion: string;
}

const CreatePatientProfileScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.patientProfile);
  const user = useSelector((state: RootState) => state.auth.user); // Get current user from auth slice

  useEffect(() => {
    dispatch(clearPatientProfileError());
  }, [dispatch]);

  const initialValues: PatientProfileValues = {
    gender: '',
    age: '',
    address1: '',
    address2: '',
    occupation: '',
    phoneNumber: '',
    tribe: '',
    religion: '',
  };

  const validationSchema = yup.object({
    gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER'], t('patientProfile.genderInvalid')).required(t('patientProfile.genderRequired')),
    age: yup.string()
      .matches(/^[0-9]+$/, t('patientProfile.ageInvalid'))
      .required(t('patientProfile.ageRequired'))
      .test('is-positive', t('patientProfile.agePositive'), value => {
        return value ? parseInt(value) > 0 : true;
      }),
    address1: yup.string().required(t('patientProfile.address1Required')),
    phoneNumber: yup.string().required(t('patientProfile.phoneNumberRequired')),
    // Optional fields can be left without .required() or use .nullable()
    address2: yup.string().nullable(),
    occupation: yup.string().nullable(),
    tribe: yup.string().nullable(),
    religion: yup.string().nullable(),
  });

  const handleSubmit = async (
    values: PatientProfileValues,
    actions: FormikHelpers<PatientProfileValues>
  ) => {
    // Convert age string to number
    const ageAsNumber = parseInt(values.age);

    const dataToSend = {
      ...values,
      age: ageAsNumber,
    };

    const resultAction = await dispatch(createPatientProfile(dataToSend));

    if (createPatientProfile.fulfilled.match(resultAction)) {
      Alert.alert(t('common.success'), t('patientProfile.submissionSuccess'));
      // OPTIONAL: If the backend updates the user's role/patientProfileId upon profile creation,
      // you would dispatch an action here to update the user in the authSlice as well.
      // Example: If backend returns updated user data:
      // dispatch(updateUserRoleOrProfileId(resultAction.payload.data.user));
      // Or, if your patientProfile response includes userId AND patientProfileId, you can update auth.user:
      if (user && resultAction.payload.data?.id) {
          dispatch(setAuthUser({ // Assuming you add setAuthUser action to authSlice
              ...user,
              patientProfileId: resultAction.payload.data.id,
              // If patient profile creation implies a role change (e.g., from UNVERIFIED to PATIENT)
              // role: 'PATIENT' // Only if this is how your backend/roles are structured
          }));
      }
      router.replace('/(tabs)/'); // Navigate to home/dashboard
    }
    // Errors are handled by Redux state and displayed in the UI
  };

  const genders = [
    { label: t('patientProfile.selectGender'), value: '' },
    { label: t('patientProfile.male'), value: 'MALE' },
    { label: t('patientProfile.female'), value: 'FEMALE' },
    { label: t('patientProfile.other'), value: 'OTHER' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>
          {t('patientProfile.title')}
        </CustomText>
        <CustomText type="body2" style={styles.subtitle}>
          {t('patientProfile.subtitle')}
        </CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Gender Picker */}
              <View style={styles.pickerContainer}>
                <CustomText type="body4" style={styles.pickerLabel}>
                  {t('patientProfile.genderLabel')}
                </CustomText>
                <Picker
                  selectedValue={values.gender}
                  onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                  style={styles.picker}
                >
                  {genders.map((item, index) => (
                    <Picker.Item key={index} label={item.label} value={item.value} />
                  ))}
                </Picker>
                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              <AuthInputField
                name="age"
                label={t('patientProfile.ageLabel')}
                placeholder={t('patientProfile.agePlaceholder')}
                keyboardType="numeric"
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="address1"
                label={t('patientProfile.address1Label')}
                placeholder={t('patientProfile.address1Placeholder')}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="address2"
                label={t('patientProfile.address2Label')}
                placeholder={t('patientProfile.address2Placeholder')}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="occupation"
                label={t('patientProfile.occupationLabel')}
                placeholder={t('patientProfile.occupationPlaceholder')}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="phoneNumber"
                label={t('patientProfile.phoneNumberLabel')}
                placeholder={t('patientProfile.phoneNumberPlaceholder')}
                keyboardType="phone-pad"
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="tribe"
                label={t('patientProfile.tribeLabel')}
                placeholder={t('patientProfile.tribePlaceholder')}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="religion"
                label={t('patientProfile.religionLabel')}
                placeholder={t('patientProfile.religionPlaceholder')}
                containerStyle={styles.inputField}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t('patientProfile.submitButton')}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t('patientProfile.loading')}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePatientProfileScreen;

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
    maxWidth: 450,
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
    backgroundColor: COLORS.background,
  },
  pickerLabel: {
    paddingLeft: 10,
    paddingTop: 8,
    color: COLORS.dark,
  },
  picker: {
    width: '100%',
    height: 50,
    color: COLORS.text,
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
**Note:** For `setAuthUser` to work, you'll need to add it to your `authSlice.ts` reducers:
```typescript
// src/redux/slices/authSlice.ts (add this to your reducers)

// ... existing imports and initialState

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ... existing logout, clearAuthError
    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload; // Allows updating specific user fields like role, profile IDs
    },
  },
  // ... extraReducers
});

export const { logout, clearAuthError, setAuthUser } = authSlice.actions; // Export it
export default authSlice.reducer;
```

**4.2. General Profile View Screen (`app/(tabs)/profile/my-profile.tsx`)**

This screen will intelligently display the user's profile based on their role and completed profiles. It will also be the entry point for "Become a Doctor" for patients.

```typescript
// app/(tabs)/profile/my-profile.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { CustomText, AppButton } from '@/components';
import { COLORS } from '@/constants/theme';
import { logout, setAuthUser } from '@/redux/slices/authSlice';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { fetchPatientProfile, clearPatientProfileError } from '@/redux/slices/patientProfileSlice';
import { fetchDoctorProfileById, clearDoctorProfileError, setDoctorProfile } from '@/redux/slices/doctorProfileSlice';

const MyProfileScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const authIsLoading = useSelector((state: RootState) => state.auth.isLoading); // For general auth loading
  const patientProfile = useSelector((state: RootState) => state.patientProfile.profile);
  const patientIsLoading = useSelector((state: RootState) => state.patientProfile.isLoading);
  const patientError = useSelector((state: RootState) => state.patientProfile.error);
  const doctorProfile = useSelector((state: RootState) => state.doctorProfile.profile);
  const doctorIsLoading = useSelector((state: RootState) => state.doctorProfile.isLoading);
  const doctorError = useSelector((state: RootState) => state.doctorProfile.error);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch profiles based on role and existence
  useEffect(() => {
    const loadProfiles = async () => {
      if (authUser && authUser.id) {
        // Fetch patient profile if user is a patient or has a patient profile ID
        if (authUser.role === 'PATIENT' && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap(); // Pass user ID as patient ID (assuming correlation)
        } else if (authUser.role === 'DOCTOR' && authUser.doctorProfileId) {
          // Fetch doctor profile if user is a doctor and has a doctor profile ID
          await dispatch(fetchDoctorProfileById(authUser.doctorProfileId)).unwrap();
        }
      }
      setInitialLoadComplete(true);
    };
    if (!initialLoadComplete) {
        loadProfiles();
    }
  }, [authUser, dispatch, initialLoadComplete]);

  // Handle errors from profile fetches
  useEffect(() => {
    if (patientError) {
      Alert.alert(t('common.error'), patientError);
      dispatch(clearPatientProfileError());
    }
    if (doctorError) {
      Alert.alert(t('common.error'), doctorError);
      dispatch(clearDoctorProfileError());
    }
  }, [patientError, doctorError, dispatch, t]);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.logout'), onPress: () => {
          dispatch(logout());
          router.replace('/auth/login'); // Redirect to login
        }},
      ]
    );
  };

  const handleCreatePatientProfile = () => {
    router.push('/profile/create-patient'); // Adjust path as needed based on your routing
  };

  const handleCreateDoctorProfile = () => {
    router.push('/profile/create-doctor'); // Adjust path as needed
  };

  const handleEditProfile = () => {
    // Navigate to an edit screen, passing current profile data
    if (authUser?.role === 'PATIENT' && patientProfile) {
      router.push({ pathname: '/profile/edit-patient', params: patientProfile });
    } else if (authUser?.role === 'DOCTOR' && doctorProfile) {
      router.push({ pathname: '/profile/edit-doctor', params: doctorProfile });
    } else {
      Alert.alert(t('common.info'), t('profile.noProfileToEdit'));
    }
  };

  if (!authUser || authIsLoading || !initialLoadComplete || patientIsLoading || doctorIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('profile.loadingProfile')}</CustomText>
      </View>
    );
  }

  // --- Render based on User Role and Profile Existence ---
  const renderPatientProfile = () => (
    <View style={styles.profileSection}>
      <CustomText type="h3" style={styles.sectionHeader}>{t('profile.patientDetails')}</CustomText>
      <CustomText type="body3">{t('patientProfile.genderLabel')}: {patientProfile?.gender}</CustomText>
      <CustomText type="body3">{t('patientProfile.ageLabel')}: {patientProfile?.age}</CustomText>
      <CustomText type="body3">{t('patientProfile.address1Label')}: {patientProfile?.address1}</CustomText>
      {patientProfile?.address2 && <CustomText type="body3">{t('patientProfile.address2Label')}: {patientProfile?.address2}</CustomText>}
      {patientProfile?.occupation && <CustomText type="body3">{t('patientProfile.occupationLabel')}: {patientProfile?.occupation}</CustomText>}
      <CustomText type="body3">{t('patientProfile.phoneNumberLabel')}: {patientProfile?.phoneNumber}</CustomText>
      {patientProfile?.tribe && <CustomText type="body3">{t('patientProfile.tribeLabel')}: {patientProfile?.tribe}</CustomText>}
      {patientProfile?.religion && <CustomText type="body3">{t('patientProfile.religionLabel')}: {patientProfile?.religion}</CustomText>}
      <AppButton
        title={t('profile.editPatientProfile')}
        onPress={handleEditProfile}
        backgroundColor={COLORS.secondary}
        textColor={COLORS.dark}
        containerStyle={styles.editButton}
      />
    </View>
  );

  const renderDoctorProfile = () => (
    <View style={styles.profileSection}>
      <CustomText type="h3" style={styles.sectionHeader}>{t('profile.doctorDetails')}</CustomText>
      <CustomText type="body3">{t('doctorProfile.specializationLabel')}: {doctorProfile?.specialization}</CustomText>
      <CustomText type="body3">{t('doctorProfile.feeLabel')}: ${doctorProfile?.fee}</CustomText>
      <CustomText type="body3">{t('profile.verificationStatus')}: {doctorProfile?.verificationStatus}</CustomText>
      {doctorProfile?.documents && (
        <TouchableOpacity onPress={() => Alert.alert('View Document', 'Implement document viewer here.')}>
          <CustomText style={styles.viewDocLink}>{t('profile.viewDocuments')}</CustomText>
        </TouchableOpacity>
      )}
      <AppButton
        title={t('profile.editDoctorProfile')}
        onPress={handleEditProfile}
        backgroundColor={COLORS.secondary}
        textColor={COLORS.dark}
        containerStyle={styles.editButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.mainHeader}>{t('profile.myProfile')}</CustomText>

        <View style={styles.profileSection}>
          <CustomText type="h2" style={styles.sectionHeader}>{t('profile.basicInfo')}</CustomText>
          <CustomText type="body3">{t('profile.name')}: {authUser?.firstname} {authUser?.lastname}</CustomText>
          <CustomText type="body3">{t('profile.email')}: {authUser?.email}</CustomText>
          <CustomText type="body3">{t('profile.role')}: {authUser?.role}</CustomText>
        </View>

        {/* Conditional rendering for Patient profile */}
        {authUser?.role === 'PATIENT' && !patientProfile && !patientIsLoading && (
          <View style={styles.callToAction}>
            <CustomText type="body2" style={styles.callToActionText}>
              {t('profile.completePatientProfilePrompt')}
            </CustomText>
            <AppButton
              title={t('profile.completePatientProfileButton')}
              onPress={handleCreatePatientProfile}
              backgroundColor={COLORS.primary}
              containerStyle={styles.actionButton}
            />
            <CustomText type="body2" style={styles.callToActionText}>
              {t('profile.wantToBeDoctorPrompt')}
            </CustomText>
            <AppButton
              title={t('profile.becomeDoctorButton')}
              onPress={handleCreateDoctorProfile}
              backgroundColor={COLORS.accent}
              textColor={COLORS.white}
              containerStyle={styles.actionButton}
            />
          </View>
        )}
        {authUser?.role === 'PATIENT' && patientProfile && renderPatientProfile()}

        {/* Conditional rendering for Doctor profile */}
        {(authUser?.role === 'PENDING_DOCTOR' || (authUser?.role === 'PATIENT' && !patientProfile)) && (
          <View style={styles.callToAction}>
             <CustomText type="body2" style={styles.callToActionText}>
              {t('profile.becomeDoctorPrompt')}
            </CustomText>
            <AppButton
              title={t('profile.becomeDoctorButton')}
              onPress={handleCreateDoctorProfile}
              backgroundColor={COLORS.accent}
              textColor={COLORS.white}
              containerStyle={styles.actionButton}
            />
          </View>
        )}
        {authUser?.role === 'DOCTOR' && doctorProfile && renderDoctorProfile()}
        {authUser?.role === 'DOCTOR' && !doctorProfile && !doctorIsLoading && (
            <View style={styles.callToAction}>
                <CustomText type="body2" style={styles.callToActionText}>
                    {t('profile.doctorProfileMissing')}
                </CustomText>
                <AppButton
                    title={t('profile.createDoctorProfileNow')}
                    onPress={handleCreateDoctorProfile}
                    backgroundColor={COLORS.primary}
                    containerStyle={styles.actionButton}
                />
            </View>
        )}
        {/* If user is PENDING_DOCTOR and has submitted doctor profile, just show pending status */}
        {authUser?.role === 'PENDING_DOCTOR' && doctorProfile && (
            <View style={styles.profileSection}>
                <CustomText type="h3" style={styles.sectionHeader}>{t('profile.doctorVerification')}</CustomText>
                <CustomText type="body3">{t('profile.verificationStatus')}: {doctorProfile.verificationStatus}</CustomText>
                <CustomText type="body3">{t('profile.pendingVerificationMessage')}</CustomText>
            </View>
        )}


        <AppButton
          title={t('common.logout')}
          onPress={handleLogout}
          backgroundColor={COLORS.danger}
          containerStyle={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F7F7F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F7F7F7',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text || '#333',
  },
  mainHeader: {
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.primary,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 10,
    color: COLORS.dark || '#333',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#EEE',
    paddingBottom: 5,
  },
  viewDocLink: {
    color: COLORS.info,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  callToAction: {
    backgroundColor: COLORS.infoLight || '#E0F7FA', // A light background for prompts
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.info || '#00BCD4',
  },
  callToActionText: {
    textAlign: 'center',
    marginBottom: 15,
    color: COLORS.dark || '#333',
  },
  actionButton: {
    width: '80%',
    marginBottom: 10,
  },
  editButton: {
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: COLORS.accent || '#FFC107',
    textColor: COLORS.dark,
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
  // Re-use from other screens
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  pickerLabel: {
    paddingLeft: 10,
    paddingTop: 8,
    color: COLORS.dark,
  },
  picker: {
    width: '100%',
    height: 50,
    color: COLORS.text,
  },
  inputField: {
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
    fontSize: 12,
  },
});
```

---

### Step 5: Update Root Navigation (`app/(tabs)/_layout.tsx`) & Conditional Redirect

We need to ensure that after a user logs in, if they haven't completed their required profile (patient or doctor), they are redirected to the appropriate screen.

```typescript
// app/(tabs)/_layout.tsx (updated to include profile completion logic)

import { Tabs, Redirect } from 'expo-router'; // Import Redirect
import { FontAwesome } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { fetchPatientProfile } from '@/redux/slices/patientProfileSlice';
import { fetchDoctorProfileById } from '@/redux/slices/doctorProfileSlice';
import { COLORS } from '@/constants/theme'; // Assuming you have COLORS

export default function TabLayout() {
  const dispatch: AppDispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authIsLoading = useSelector((state: RootState) => state.auth.isLoading);
  const patientProfile = useSelector((state: RootState) => state.patientProfile.profile);
  const patientIsLoading = useSelector((state: RootState) => state.patientProfile.isLoading);
  const doctorProfile = useSelector((state: RootState) => state.doctorProfile.profile);
  const doctorIsLoading = useSelector((state: RootState) => state.doctorProfile.isLoading);

  const [hasCheckedProfiles, setHasCheckedProfiles] = React.useState(false);

  useEffect(() => {
    const checkAndFetchProfiles = async () => {
      if (authUser && !authIsLoading) {
        // If user is a PATIENT and has a patientProfileId, try to fetch it
        if (authUser.role === 'PATIENT' && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap(); // assuming patientId is userId
        }
        // If user is a DOCTOR and has a doctorProfileId, try to fetch it
        else if (authUser.role === 'DOCTOR' && authUser.doctorProfileId) {
          await dispatch(fetchDoctorProfileById(authUser.doctorProfileId)).unwrap();
        }
        setHasCheckedProfiles(true);
      } else if (!authUser && !authIsLoading) {
        // No authenticated user, so no profiles to check. Mark as checked to allow redirect to login.
        setHasCheckedProfiles(true);
      }
    };

    if (!hasCheckedProfiles && !authIsLoading && authUser) { // Only run if not already checked and authUser is loaded
      checkAndFetchProfiles();
    }
  }, [authUser, authIsLoading, hasCheckedProfiles, dispatch]);

  // If user data is still loading or initial profile checks are pending, show a loader
  if (authIsLoading || !hasCheckedProfiles || patientIsLoading || doctorIsLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  // Determine redirection based on user role and profile completion
  if (authUser) {
    // Check if user has a basic profile (patient or doctor)
    const hasPatientProfile = !!patientProfile;
    const hasDoctorProfile = !!doctorProfile;

    // --- Redirection Logic ---
    // If user is logged in, but their main role's profile is not complete
    if (authUser.role === 'PATIENT' && !hasPatientProfile) {
      return <Redirect href="/profile/create-patient" />;
    }
    // If user is a DOCTOR but their doctor profile is missing
    // Note: A user's role transitions from initial (e.g., PATIENT) -> PENDING_DOCTOR (after submission) -> DOCTOR (after admin approval)
    // Here we handle the case where they are already DOCTOR but somehow profile data is missing in client state
    if (authUser.role === 'DOCTOR' && !hasDoctorProfile) {
      return <Redirect href="/profile/create-doctor" />; // Should not happen often if backend is consistent
    }

    // No redirection needed, proceed with normal tabs
    const isAdmin = authUser?.role === 'ADMIN';
    const isDoctor = authUser?.role === 'DOCTOR';
    const isPatient = authUser?.role === 'PATIENT'; // Consider 'PENDING_DOCTOR' as well if you have it

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
              name="doctor/my-appointments"
              options={{
                title: 'My Schedule',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-check-o" color={color} />,
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="doctor/my-patients"
              options={{
                title: 'My Patients',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="group" color={color} />,
                headerShown: false,
              }}
            />
          </>
        )}

        {/* Patient-specific tabs (if needed, e.g., for booking) */}
        {isPatient && (
          <Tabs.Screen
            name="book-appointment"
            options={{
              title: 'Book',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-plus-o" color={color} />,
              headerShown: false,
            }}
          />
        )}

        {/* Admin-specific tab */}
        {isAdmin && (
          <Tabs.Screen
            name="admin/kyc-list"
            options={{
              title: 'Admin KYC',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="gavel" color={color} />,
              headerShown: false,
            }}
          />
        )}

        <Tabs.Screen
          name="profile/my-profile" // Corrected path to my-profile
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
            headerShown: false,
          }}
        />
        {/*
          Hidden Screens: These screens are part of the navigation stack but not directly
          accessible via tabs. They are typically pushed via router.push()
        */}
        <Tabs.Screen name="profile/create-patient" options={{ href: null }} />
        <Tabs.Screen name="profile/create-doctor" options={{ href: null }} />
        {/* Add edit screens here too if they are separate */}
        <Tabs.Screen name="profile/edit-patient" options={{ href: null }} />
        <Tabs.Screen name="profile/edit-doctor" options={{ href: null }} />
      </Tabs>
    );
  }

  // If no authUser, redirect to login
  return <Redirect href="/auth/login" />;
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F7F7F7',
  },
});
```

**Important Backend Interaction Notes for Profile Completion & Role Management:**

*   **Initial Role:** Ensure that when a user first registers (via `POST /api/user/register`), the backend assigns them a default role like `PATIENT` or `UNVERIFIED_USER`.
*   **Patient Profile Creation:** When `POST /api/patient/create` is successful, the backend should ideally update the corresponding `User` record to link the `patientProfileId` and, if your system uses it, perhaps set their role to `PATIENT` if it wasn't already. The API response for `createPatientProfile` should ideally return the updated `User` object, or at least the `patientProfile.id`.
*   **Doctor Profile Creation:** When `POST /api/doctor/create` is successful, the backend should set the user's role to `PENDING_DOCTOR` (or `APPLICANT_DOCTOR`) and link the `doctorProfileId`.
*   **Admin Verification:** When an admin approves a doctor's KYC (`POST /api/admin/doctor-verifications/verify`), the backend *must* update that user's role to `DOCTOR`.
*   **Frontend User State Update:** After any profile creation or admin verification, if the `authUser` object in your Redux `authSlice` doesn't automatically reflect the latest `role` and `*ProfileId` changes, you will need to:
    1.  Dispatch `setAuthUser` with the updated `User` object received from the backend (if the backend sends it back in the response).
    2.  Or, if the backend doesn't send the updated user, you might dispatch `loadUserFromStorage()` again (which would re-fetch user data from SecureStore, assuming it was updated there, or from a `GET /api/user/me` endpoint if you implement one).

This comprehensive approach sets up profile completion for both patient and doctor roles, and handles the necessary navigation and state management around it. Remember to add the new translation keys to your i18n files!