import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router'; // To get appointmentId from params

import { AppButton, AuthInputField, CustomText } from '@/components';
import { COLORS } from '@/constants/theme';
import { recordConsultation, clearConsultationError } from '@/redux/slice/consultationSlice';
import { AppDispatch, RootState } from '@/redux/store';

interface ConsultationValues {
  presentingComplaints: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  pastHistory: string;
}

const RecordConsultationScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.consultation);

  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>(); // Get appointmentId from navigation params

  useEffect(() => {
    dispatch(clearConsultationError());
  }, [dispatch]);

  const initialValues: ConsultationValues = {
    presentingComplaints: '',
    diagnosticImpression: '',
    investigations: '',
    treatment: '',
    pastHistory: '',
  };

  const validationSchema = yup.object({
    presentingComplaints: yup.string().required(t('consultation.complaintsRequired')),
    diagnosticImpression: yup.string().required(t('consultation.diagnosisRequired')),
    investigations: yup.string().required(t('consultation.investigationsRequired')),
    treatment: yup.string().required(t('consultation.treatmentRequired')),
    pastHistory: yup.string().required(t('consultation.pastHistoryRequired')),
  });

  const handleSubmit = async (
    values: ConsultationValues,
    actions: FormikHelpers<ConsultationValues>
  ) => {
    if (!appointmentId) {
      Alert.alert(t('common.error'), t('consultation.noAppointmentId'));
      return;
    }

    const resultAction = await dispatch(recordConsultation({ ...values, appointmentId }));

    if (recordConsultation.fulfilled.match(resultAction)) {
      Alert.alert(t('common.success'), t('consultation.recordSuccess'));
      actions.resetForm();
      router.back(); // Or router.replace('/doctor/my-consultations')
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>{t('consultation.title')}</CustomText>
        <CustomText type="body2" style={styles.subtitle}>{t('consultation.subtitle')}</CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, errors, touched }) => (
            <View style={styles.form}>
              <AuthInputField
                name="presentingComplaints"
                label={t('consultation.complaintsLabel')}
                placeholder={t('consultation.complaintsPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />
              <AuthInputField
                name="diagnosticImpression"
                label={t('consultation.diagnosisLabel')}
                placeholder={t('consultation.diagnosisPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />
              <AuthInputField
                name="investigations"
                label={t('consultation.investigationsLabel')}
                placeholder={t('consultation.investigationsPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />
              <AuthInputField
                name="treatment"
                label={t('consultation.treatmentLabel')}
                placeholder={t('consultation.treatmentPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />
              <AuthInputField
                name="pastHistory"
                label={t('consultation.pastHistoryLabel')}
                placeholder={t('consultation.pastHistoryPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />

              {/* {error && <Text style={styles.errorText}>{error}</Text>} */}

              <AppButton
                title={t('consultation.submitButton')}
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

export default RecordConsultationScreen;

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
});