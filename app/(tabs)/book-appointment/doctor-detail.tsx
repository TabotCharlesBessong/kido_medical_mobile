import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchDoctorProfileById,
  clearDoctorProfileError,
} from "@/redux/slice/doctorProfileSlice";
import {
  fetchTimeslotsForSpecificDoctor,
  clearTimeslotError,
} from "@/redux/slice/timeslotSlice";
import {
  bookAppointment,
  clearAppointmentError,
} from "@/redux/slice/appointmentSlice";
import { CustomText, AppButton, AuthInputField } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";


interface AppointmentFormValues {
  selectedDate: string; // YYYY-MM-DD
  selectedTimeslotId: string;
  reason: string;
}

const DoctorDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();

  const {
    profile: doctorProfile,
    isLoading: doctorLoading,
    error: doctorError,
  } = useSelector((state: RootState) => state.doctorProfile);
  const {
    allDoctorTimeslots,
    isLoading: timeslotLoading,
    error: timeslotError,
  } = useSelector((state: RootState) => state.timeslot);
  const { isLoading: bookingLoading, error: bookingError } = useSelector(
    (state: RootState) => state.appointment
  );
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user

  const doctorSpecificTimeslots = doctorId ? allDoctorTimeslots[doctorId] : [];
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateFilter, setCurrentDateFilter] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorProfileById(doctorId));
      dispatch(fetchTimeslotsForSpecificDoctor(doctorId));
    }
    return () => {
      dispatch(clearDoctorProfileError());
      dispatch(clearTimeslotError());
      dispatch(clearAppointmentError());
    };
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (doctorError) Alert.alert(t("common.error"), doctorError);
    if (timeslotError) Alert.alert(t("common.error"), timeslotError);
    if (bookingError) Alert.alert(t("common.error"), bookingError);
  }, [doctorError, timeslotError, bookingError, t]);

  const validationSchema = yup.object({
    selectedDate: yup.string().required(t("bookAppointment.dateRequired")),
    selectedTimeslotId: yup
      .string()
      .required(t("bookAppointment.timeslotRequired")),
    reason: yup.string().required(t("bookAppointment.reasonRequired")),
  });

  const handleSubmit = async (
    values: AppointmentFormValues,
    actions: FormikHelpers<AppointmentFormValues>
  ) => {
    if (!doctorId) {
      Alert.alert(t("common.error"), t("bookAppointment.noDoctorSelected"));
      return;
    }

    const resultAction = await dispatch(
      bookAppointment({
        doctorId: doctorId,
        date: format(new Date(values.selectedDate), "M/dd/yyyy"), // Format as "M/dd/yyyy" for backend
        timeslotId: values.selectedTimeslotId,
        reason: values.reason,
      })
    );

    if (bookAppointment.fulfilled.match(resultAction)) {
      Alert.alert(t("common.success"), t("bookAppointment.bookingSuccess"));
      actions.resetForm();
      dispatch(fetchTimeslotsForSpecificDoctor(doctorId)); // Re-fetch timeslots to update availability
      // @ts-ignore
      router.replace("/my-appointments"); // Navigate to patient's own appointments
    }
  };

  const handleMessageDoctor = () => {
    if (!authUser?.id || !doctorProfile?.userId) {
      Alert.alert(t("common.error"), t("messages.chatNotAvailable"));
      return;
    }
    if (authUser.id === doctorProfile.userId) {
      Alert.alert(t("common.info"), t("messages.cannotChatSelf"));
      return;
    }
    // Navigate to custom chat screen
    router.push({
      // @ts-ignore
      pathname: `/messages/chat/[chatPartnerId]`,
      params: {
        chatPartnerId: doctorProfile.userId,
        chatPartnerName: doctorName || `${doctorProfile.userId}'s Profile`,
      },
    });
  };

  const filteredTimeslots =
    doctorSpecificTimeslots?.filter(
      (ts) =>
        !ts.isBooked &&
        format(new Date(ts.startTime), "yyyy-MM-dd") === currentDateFilter
    ) || [];

  if (doctorLoading || timeslotLoading || bookingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingDetails")}
        </CustomText>
      </View>
    );
  }

  if (!doctorProfile) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>
          {t("doctorDetail.doctorNotFound")}
        </CustomText>
        <AppButton
          title={t("common.goBack")}
          onPress={() => router.back()}
          backgroundColor={COLORS.primary}
          containerStyle={{ marginTop: 20, width: "50%" }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>
          {t("doctorDetail.title", {
            doctorName: doctorName || `${doctorProfile.userId}'s Profile`,
          })}
        </CustomText>

        {/* Doctor Profile Details */}
        <View style={styles.profileCard}>
          <CustomText type="h3" style={styles.cardHeader}>
            {t("doctorDetail.doctorInfo")}
          </CustomText>
          <CustomText type="body3">
            {t("doctorDetail.specialization")}: {doctorProfile.specialization}
          </CustomText>
          <CustomText type="body3">
            {t("doctorDetail.fee")}: ${doctorProfile.fee}
          </CustomText>
          {/* Add more doctor details if available */}
        </View>

        {/* Message Doctor Button */}
        {authUser?.id &&
          doctorProfile?.userId &&
          authUser.id !== doctorProfile.userId && (
            <AppButton
              title={t("doctorDetail.messageDoctor")}
              onPress={handleMessageDoctor}
              backgroundColor={COLORS.info}
              textColor={COLORS.white}
              containerStyle={styles.messageButton}
              loading={bookingLoading} // Link to general screen loading if desired
              loadingText={t("common.loading")}
            />
          )}

        {/* Appointment Booking Form */}
        <CustomText type="h2" style={styles.sectionHeader}>
          {t("bookAppointment.title")}
        </CustomText>
        <Formik
          initialValues={{
            selectedDate: currentDateFilter,
            selectedTimeslotId: "",
            reason: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Date Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" style={styles.pickerLabel}>
                  {t("bookAppointment.dateLabel")}
                </CustomText>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text>
                    {values.selectedDate
                      ? format(new Date(values.selectedDate), "PPP")
                      : t("bookAppointment.selectDate")}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      values.selectedDate
                        ? new Date(values.selectedDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        const formattedDate = format(
                          selectedDate,
                          "yyyy-MM-dd"
                        );
                        setFieldValue("selectedDate", formattedDate);
                        setCurrentDateFilter(formattedDate);
                        setFieldValue("selectedTimeslotId", "");
                      }
                    }}
                  />
                )}
                {touched.selectedDate && errors.selectedDate && (
                  <Text style={styles.errorText}>{errors.selectedDate}</Text>
                )}
              </View>

              {/* Timeslot Picker */}
              <View style={styles.inputGroup}>
                <CustomText type="body4" style={styles.pickerLabel}>
                  {t("bookAppointment.timeslotLabel")}
                </CustomText>
                <Picker
                  selectedValue={values.selectedTimeslotId}
                  onValueChange={(itemValue) =>
                    setFieldValue("selectedTimeslotId", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item
                    label={t("bookAppointment.selectTimeslot")}
                    value=""
                  />
                  {filteredTimeslots.map((ts) => (
                    <Picker.Item
                      key={ts.id}
                      label={`${format(
                        new Date(ts.startTime),
                        "HH:mm"
                      )} - ${format(new Date(ts.endTime), "HH:mm")}`}
                      value={ts.id}
                    />
                  ))}
                </Picker>
                {touched.selectedTimeslotId && errors.selectedTimeslotId && (
                  <Text style={styles.errorText}>
                    {errors.selectedTimeslotId}
                  </Text>
                )}
                {filteredTimeslots.length === 0 && values.selectedDate && (
                  <Text style={styles.infoText}>
                    {t("bookAppointment.noAvailableTimeslotsForDate")}
                  </Text>
                )}
              </View>

              <AuthInputField
                name="reason"
                label={t("bookAppointment.reasonLabel")}
                placeholder={t("bookAppointment.reasonPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
              />

              {(doctorError || timeslotError || bookingError) && (
                <Text style={styles.errorText}>
                  {doctorError || timeslotError || bookingLoading}
                </Text>
              )}

              <AppButton
                title={t("bookAppointment.submitButton")}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={bookingLoading}
                loadingText={t("common.booking")}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DoctorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  profileCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    maxWidth: 450,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: 10,
    color: COLORS.dark,
  },
  messageButton: {
    // Style for the new message button
    width: "100%",
    marginTop: 15,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
    color: COLORS.primary,
  },
  form: {
    width: "100%",
    maxWidth: 450,
    alignItems: "center",
  },
  inputGroup: {
    width: "100%",
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
    justifyContent: "center",
    alignItems: "flex-start",
    height: 50,
  },
  picker: {
    width: "100%",
    height: 50,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
  },
  inputField: {
    marginBottom: 15,
    width: "100%",
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: "center",
    width: "100%",
    fontSize: 12,
  },
  infoText: {
    color: COLORS.gray,
    marginTop: 5,
    textAlign: "center",
    width: "100%",
    fontSize: 12,
  },
  submitButton: {
    width: "100%",
    marginTop: 20,
  },
});
