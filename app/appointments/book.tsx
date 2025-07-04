import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchDoctors,
  selectDoctors,
  selectDoctorsLoading,
  selectDoctorsError,
} from "@/redux/slice/doctor.slice";
import {
  fetchTimeSlots,
  selectTimeSlots,
  selectTimeSlotsLoading,
  selectTimeSlotsError,
} from "@/redux/slice/timeslot.slice";
import { createAppointment } from "@/redux/slice/appointment.slice";
import { format } from "date-fns";

const BookAppointmentScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [reason, setReason] = useState("");

  const doctors = useSelector(selectDoctors);
  const doctorsLoading = useSelector(selectDoctorsLoading);
  const doctorsError = useSelector(selectDoctorsError);

  const timeSlots = useSelector(selectTimeSlots);
  const timeSlotsLoading = useSelector(selectTimeSlotsLoading);
  const timeSlotsError = useSelector(selectTimeSlotsError);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDoctor) {
      dispatch(
        fetchTimeSlots({
          doctorId: selectedDoctor.id,
          date: format(selectedDate, "yyyy-MM-dd"),
        })
      );
    }
  }, [dispatch, selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedTimeSlot || !reason) {
      return;
    }

    try {
      await dispatch(
        createAppointment({
          doctorId: selectedDoctor.id,
          timeSlotId: selectedTimeSlot.id,
          reason,
        })
      ).unwrap();

      router.back();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const renderDoctorItem = (doctor: any) => (
    <TouchableOpacity
      style={[
        styles.doctorItem,
        selectedDoctor?.id === doctor.id && styles.selectedItem,
      ]}
      onPress={() => setSelectedDoctor(doctor)}
    >
      <View style={styles.doctorInfo}>
        <CustomText type="body3">Dr. {doctor.name}</CustomText>
        <CustomText type="body4">{doctor.specialty}</CustomText>
        <CustomText type="body4">{doctor.experience} years experience</CustomText>
      </View>
      <MaterialIcons
        name={selectedDoctor?.id === doctor.id ? "check-circle" : "radio-button-unchecked"}
        size={24}
        color={selectedDoctor?.id === doctor.id ? COLORS.primary : COLORS.gray}
      />
    </TouchableOpacity>
  );

  const renderTimeSlotItem = (timeSlot: any) => (
    <TouchableOpacity
      style={[
        styles.timeSlotItem,
        selectedTimeSlot?.id === timeSlot.id && styles.selectedItem,
      ]}
      onPress={() => setSelectedTimeSlot(timeSlot)}
    >
      <CustomText type="body3">
        {format(new Date(timeSlot.startTime), "hh:mm a")} -{" "}
        {format(new Date(timeSlot.endTime), "hh:mm a")}
      </CustomText>
      <MaterialIcons
        name={
          selectedTimeSlot?.id === timeSlot.id
            ? "check-circle"
            : "radio-button-unchecked"
        }
        size={24}
        color={
          selectedTimeSlot?.id === timeSlot.id ? COLORS.primary : COLORS.gray
        }
      />
    </TouchableOpacity>
  );

  if (doctorsLoading || timeSlotsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (doctorsError || timeSlotsError) {
    return (
      <View style={styles.errorContainer}>
        <CustomText type="body1" style={styles.errorText}>
          {doctorsError || timeSlotsError}
        </CustomText>
        <AppButton
          title={t("common.retry")}
          onPress={() => {
            dispatch(fetchDoctors());
            if (selectedDoctor) {
              dispatch(
                fetchTimeSlots({
                  doctorId: selectedDoctor.id,
                  date: format(selectedDate, "yyyy-MM-dd"),
                })
              );
            }
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type="h1">{t("appointments.book")}</CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <CustomText type="h2">{t("appointments.selectDoctor")}</CustomText>
        {doctors.map((doctor) => renderDoctorItem(doctor))}

        {selectedDoctor && (
          <>
            <CustomText type="h2" style={styles.sectionTitle}>
              {t("appointments.selectDate")}
            </CustomText>
            <View style={styles.dateSelector}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setSelectedDate(
                    new Date(selectedDate.setDate(selectedDate.getDate() - 1))
                  )
                }
              >
                <MaterialIcons name="chevron-left" size={24} color={COLORS.black} />
              </TouchableOpacity>
              <CustomText type="body2">
                {format(selectedDate, "MMMM dd, yyyy")}
              </CustomText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setSelectedDate(
                    new Date(selectedDate.setDate(selectedDate.getDate() + 1))
                  )
                }
              >
                <MaterialIcons name="chevron-right" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <CustomText type="h2" style={styles.sectionTitle}>
              {t("appointments.selectTime")}
            </CustomText>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((timeSlot) => renderTimeSlotItem(timeSlot))}
            </View>

            <CustomText type="h2" style={styles.sectionTitle}>
              {t("appointments.reason")}
            </CustomText>
            <View style={styles.reasonInput}>
              <CustomText
                type="body3"
                style={styles.reasonText}
                onPress={() => {
                  // TODO: Implement reason input
                }}
              >
                {reason || t("appointments.enterReason")}
              </CustomText>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title={t("appointments.book")}
          onPress={handleBookAppointment}
          disabled={!selectedDoctor || !selectedTimeSlot || !reason}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 20,
    textAlign: "center",
  },
  doctorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 5,
  },
  selectedItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  doctorInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  dateButton: {
    padding: 8,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "48%",
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 5,
  },
  reasonInput: {
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 5,
  },
  reasonText: {
    color: COLORS.gray,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
});

export default BookAppointmentScreen; 