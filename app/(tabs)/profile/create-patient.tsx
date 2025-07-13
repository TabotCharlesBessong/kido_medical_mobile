import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Text, ScrollView, Platform, Alert } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';

import { AppButton, AuthInputField, AuthSelectField, CustomText } from '@/components';
import { createPatientProfile, clearPatientProfileError } from '@/redux/slice/patientProfileSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { setAuthUser } from '@/redux/slice/authSlice'; // Import to update user role/profile ID in auth state
import { COLORS } from '@/utils/constants';

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
      router.replace('/(tabs)'); // Navigate to home/dashboard
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1">{t("patientProfile.title")}</CustomText>
        <CustomText type="body2">{t("patientProfile.subtitle")}</CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Gender Picker */}
              {/* <View style={styles.pickerContainer}>
                <CustomText type="body4" >
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
              </View> */}

              <AuthSelectField
                name="gender"
                label={t("complete.form.label1")}
                options={[
                  { label: t("complete.options.one"), value: "MALE" },
                  { label: t("complete.options.two"), value: "FEMALE" },
                ]}
                placeholder={t("complete.form.placeholder1")}
              />

              <AuthInputField
                name="age"
                label={t("patientProfile.ageLabel")}
                placeholder={t("patientProfile.agePlaceholder")}
                keyboardType="numeric"
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="address1"
                label={t("patientProfile.address1Label")}
                placeholder={t("patientProfile.address1Placeholder")}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="address2"
                label={t("patientProfile.address2Label")}
                placeholder={t("patientProfile.address2Placeholder")}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="occupation"
                label={t("patientProfile.occupationLabel")}
                placeholder={t("patientProfile.occupationPlaceholder")}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="phoneNumber"
                label={t("patientProfile.phoneNumberLabel")}
                placeholder={t("patientProfile.phoneNumberPlaceholder")}
                keyboardType="phone-pad"
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="tribe"
                label={t("patientProfile.tribeLabel")}
                placeholder={t("patientProfile.tribePlaceholder")}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="religion"
                label={t("patientProfile.religionLabel")}
                placeholder={t("patientProfile.religionPlaceholder")}
                containerStyle={styles.inputField}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t("patientProfile.submitButton")}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t("patientProfile.loading")}
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