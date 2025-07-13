import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Formik, FormikHelpers, FieldArray } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // `expo install @react-native-picker/picker`
import { FontAwesome } from '@expo/vector-icons'; // `npm install @expo/vector-icons`

import { AppButton, AuthInputField, CustomText } from '@/components';
import { createPrescription, clearPrescriptionError } from '@/redux/slice/prescriptionSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Medication, MedicationFrequency } from '@/constants/types/prescription';
import { COLORS } from '@/utils/constants';

interface PrescriptionValues {
  instructions: string;
  investigation: string;
  medications: Medication[];
}

const CreatePrescriptionScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.prescription);
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();

  useEffect(() => {
    dispatch(clearPrescriptionError());
  }, [dispatch]);

  const initialValues: PrescriptionValues = {
    instructions: '',
    investigation: '',
    medications: [{ name: '', dosage: '', frequency: 'ONCE_A_DAY', duration: 0 }],
  };

  const validationSchema = yup.object({
    instructions: yup.string().required(t('prescription.instructionsRequired')),
    investigation: yup.string().required(t('prescription.investigationRequired')),
    medications: yup.array().of(
      yup.object().shape({
        name: yup.string().required(t('prescription.medicationNameRequired')),
        dosage: yup.string().required(t('prescription.dosageRequired')),
        frequency: yup.string().oneOf(
          ['ONCE_A_DAY', 'TWICE_A_DAY', 'THRICE_A_DAY', 'FOUR_TIMES_A_DAY', 'AS_NEEDED'],
          t('prescription.frequencyInvalid')
        ).required(t('prescription.frequencyRequired')),
        duration: yup.number()
          .min(1, t('prescription.durationMin'))
          .required(t('prescription.durationRequired'))
          .typeError(t('prescription.durationNumber')),
      })
    ).min(1, t('prescription.atLeastOneMedication')),
  });

  const handleSubmit = async (
    values: PrescriptionValues,
    actions: FormikHelpers<PrescriptionValues>
  ) => {
    if (!consultationId) {
      Alert.alert(t('common.error'), t('prescription.noConsultationId'));
      return;
    }

    const resultAction = await dispatch(createPrescription({ ...values, consultationId }));

    if (createPrescription.fulfilled.match(resultAction)) {
      Alert.alert(t('common.success'), t('prescription.creationSuccess'));
      actions.resetForm();
      router.back(); // Navigate back to consultation detail or list
    }
  };

  const medicationFrequencies: { label: string; value: MedicationFrequency }[] = [
    { label: t('prescription.frequencyOnceADay'), value: 'ONCE_A_DAY' },
    { label: t('prescription.frequencyTwiceADay'), value: 'TWICE_A_DAY' },
    { label: t('prescription.frequencyThriceADay'), value: 'THRICE_A_DAY' },
    { label: t('prescription.frequencyFourTimesADay'), value: 'FOUR_TIMES_A_DAY' },
    { label: t('prescription.frequencyAsNeeded'), value: 'AS_NEEDED' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>{t('prescription.title')}</CustomText>
        <CustomText type="body2" style={styles.subtitle}>{t('prescription.subtitle')}</CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, values, setFieldValue, errors, touched }) => (
            <View style={styles.form}>
              <AuthInputField
                name="instructions"
                label={t('prescription.instructionsLabel')}
                placeholder={t('prescription.instructionsPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />
              <AuthInputField
                name="investigation"
                label={t('prescription.investigationLabel')}
                placeholder={t('prescription.investigationPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />

              <CustomText type="h3" style={styles.medicationsHeader}>{t('prescription.medicationsSection')}</CustomText>
              <FieldArray name="medications">
                {({ push, remove }) => (
                  <View style={styles.medicationsContainer}>
                    {values.medications.map((medication, index) => (
                      <View key={index} style={styles.medicationCard}>
                        <CustomText type="h4" style={styles.medicationCardHeader}>
                          {t('prescription.medication')} {index + 1}
                        </CustomText>
                        <AuthInputField
                          name={`medications.${index}.name`}
                          label={t('prescription.medicationNameLabel')}
                          placeholder={t('prescription.medicationNamePlaceholder')}
                          containerStyle={styles.inputField}
                        />
                        <AuthInputField
                          name={`medications.${index}.dosage`}
                          label={t('prescription.dosageLabel')}
                          placeholder={t('prescription.dosagePlaceholder')}
                          containerStyle={styles.inputField}
                        />

                        <View style={styles.pickerContainer}>
                          <CustomText type="body4" style={styles.pickerLabel}>
                            {t('prescription.frequencyLabel')}
                          </CustomText>
                          <Picker
                            selectedValue={medication.frequency}
                            onValueChange={(itemValue) => setFieldValue(`medications.${index}.frequency`, itemValue)}
                            style={styles.picker}
                          >
                            {medicationFrequencies.map((freq, idx) => (
                              <Picker.Item key={idx} label={freq.label} value={freq.value} />
                            ))}
                          </Picker>
                          {touched.medications?.[index]?.frequency && errors.medications?.[index]?.frequency && (
                            <Text style={styles.errorText}>{errors.medications[index].frequency}</Text>
                          )}
                        </View>

                        <AuthInputField
                          name={`medications.${index}.duration`}
                          label={t('prescription.durationLabel')}
                          placeholder={t('prescription.durationPlaceholder')}
                          keyboardType="numeric"
                          containerStyle={styles.inputField}
                        />
                        {values.medications.length > 1 && (
                          <AppButton
                            title={t('prescription.removeMedication')}
                            onPress={() => remove(index)}
                            backgroundColor={COLORS.danger}
                            containerStyle={styles.removeMedicationButton}
                          />
                        )}
                      </View>
                    ))}
                    <AppButton
                      title={t('prescription.addMedication')}
                      onPress={() => push({ name: '', dosage: '', frequency: 'ONCE_A_DAY', duration: 0 })}
                      backgroundColor={COLORS.accent}
                      textColor={COLORS.white}
                      containerStyle={styles.addMedicationButton}
                      // You might want to pass a leftIcon prop to AppButton to show the FontAwesome icon
                      // leftIcon={<FontAwesome name="plus-circle" size={18} color={COLORS.white} />}
                    />
                  </View>
                )}
              </FieldArray>

              {error && <Text style={styles.errorText}>{error}</Text>}
              {touched.medications && errors.medications && typeof errors.medications === 'string' && (
                <Text style={styles.errorText}>{errors.medications}</Text>
              )}


              <AppButton
                title={t('prescription.submitButton')}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t('common.loading')}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePrescriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
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
  medicationsHeader: {
    marginTop: 20,
    marginBottom: 15,
    color: COLORS.dark,
    textAlign: 'center',
  },
  medicationsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  medicationCardHeader: {
    marginBottom: 10,
    color: COLORS.primary,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
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
  removeMedicationButton: {
    width: '60%',
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: COLORS.danger,
  },
  addMedicationButton: {
    width: '70%',
    alignSelf: 'center',
    marginTop: 10,
  },
});