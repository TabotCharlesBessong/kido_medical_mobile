import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker'; // `expo install @react-native-community/datetimepicker`

import { AppButton, AuthInputField, CustomText } from '@/components';
import { createTimeslot, clearTimeslotError, fetchDoctorTimeslots } from '@/redux/slice/timeslotSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { format } from 'date-fns'; // `npm install date-fns`
import { COLORS } from '@/utils/constants';

interface TimeslotValues {
  startDate: string; // Used for Formik, will combine with startTime (YYYY-MM-DD)
  startTime: string; // HH:MM
  endDate: string; // Used for Formik, will combine with endTime (YYYY-MM-DD)
  endTime: string;   // HH:MM
}

const CreateTimeslotScreen = () => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error, myTimeslots } = useSelector((state: RootState) => state.timeslot); // Changed to myTimeslots

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    dispatch(clearTimeslotError());
    dispatch(fetchDoctorTimeslots()); // Fetch existing timeslots on load
  }, [dispatch]);

  const initialValues: TimeslotValues = {
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  };

  const validationSchema = yup.object({
    startDate: yup.string().required(t('timeslot.startDateRequired')),
    startTime: yup.string().required(t('timeslot.startTimeRequired')),
    endDate: yup.string().required(t('timeslot.endDateRequired')),
    endTime: yup.string().required(t('timeslot.endTimeRequired')),
  }).test('start-before-end', t('timeslot.startBeforeEnd'), function(values) {
    if (!values.startDate || !values.startTime || !values.endDate || !values.endTime) {
      return true; // Let individual required errors handle empty fields
    }
    const startDateTime = new Date(`${values.startDate}T${values.startTime}:00`);
    const endDateTime = new Date(`${values.endDate}T${values.endTime}:00`);
    return startDateTime < endDateTime;
  });

  const handleSubmit = async (
    values: TimeslotValues,
    actions: FormikHelpers<TimeslotValues>
  ) => {
    try {
      const startTimeISO = new Date(`${values.startDate}T${values.startTime}:00`).toISOString();
      const endTimeISO = new Date(`${values.endDate}T${values.endTime}:00`).toISOString();

      const resultAction = await dispatch(createTimeslot({
        startTime: startTimeISO,
        endTime: endTimeISO,
      }));

      if (createTimeslot.fulfilled.match(resultAction)) {
        Alert.alert(t('common.success'), t('timeslot.creationSuccess'));
        actions.resetForm(); // Clear the form
        // Re-fetch doctor timeslots to update the list, the timeslotSlice handles adding it to myTimeslots
        // No need to dispatch fetchDoctorTimeslots() explicitly here if the reducer already adds it.
        // If not, uncomment: dispatch(fetchDoctorTimeslots());
      }
    } catch (e) {
      console.error("Submission error:", e);
      // Error message is handled by Redux state
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" >{t('timeslot.title')}</CustomText>
        <CustomText type="body2" >{t('timeslot.subtitle')}</CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Start Date Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" >{t('timeslot.startDateLabel')}</CustomText>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
                  <Text>{values.startDate ? format(new Date(values.startDate), 'PPP') : t('timeslot.selectDate')}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={values.startDate ? new Date(values.startDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setFieldValue('startDate', format(selectedDate, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                )}
                {touched.startDate && errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              </View>

              {/* Start Time Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" >{t('timeslot.startTimeLabel')}</CustomText>
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.datePickerButton}>
                  <Text>{values.startTime || t('timeslot.selectTime')}</Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={values.startTime ? new Date(`2000-01-01T${values.startTime}:00`) : new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowStartTimePicker(Platform.OS === 'ios');
                      if (selectedTime) {
                        setFieldValue('startTime', format(selectedTime, 'HH:mm'));
                      }
                    }}
                  />
                )}
                {touched.startTime && errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
              </View>

              {/* End Date Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" >{t('timeslot.endDateLabel')}</CustomText>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
                  <Text>{values.endDate ? format(new Date(values.endDate), 'PPP') : t('timeslot.selectDate')}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={values.endDate ? new Date(values.endDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setFieldValue('endDate', format(selectedDate, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                )}
                {touched.endDate && errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
              </View>

              {/* End Time Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" >{t('timeslot.endTimeLabel')}</CustomText>
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.datePickerButton}>
                  <Text>{values.endTime || t('timeslot.selectTime')}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={values.endTime ? new Date(`2000-01-01T${values.endTime}:00`) : new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowEndTimePicker(Platform.OS === 'ios');
                      if (selectedTime) {
                        setFieldValue('endTime', format(selectedTime, 'HH:mm'));
                      }
                    }}
                  />
                )}
                {touched.endTime && errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t('timeslot.submitButton')}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t('timeslot.loading')}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>

        {/* Display existing timeslots */}
        <CustomText type="h2" >{t('timeslot.existingTimeslots')}</CustomText>
        {myTimeslots.length === 0 && !isLoading ? (
          <CustomText type="body3">{t('timeslot.noTimeslots')}</CustomText>
        ) : (
          myTimeslots.map((ts) => (
            <View key={ts.id} style={styles.timeslotCard}>
              <CustomText type="body3">
                {t('timeslot.from')}: {new Date(ts.startTime).toLocaleString()}
              </CustomText>
              <CustomText type="body3">
                {t('timeslot.to')}: {new Date(ts.endTime).toLocaleString()}
              </CustomText>
              <CustomText type="body3">
                {t('timeslot.status')}: {ts.isBooked ? t('timeslot.booked') : t('timeslot.available')}
              </CustomText>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateTimeslotScreen;

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
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  pickerLabel: {
    paddingLeft: 5,
    marginBottom: 5,
    color: COLORS.dark,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align text left
    height: 50,
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
  existingTimeslotsHeader: {
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.primary,
  },
  timeslotCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    width: '100%',
  },
});