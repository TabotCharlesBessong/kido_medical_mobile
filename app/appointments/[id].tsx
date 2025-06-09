import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  selectAppointmentById,
  updateAppointment,
} from "@/redux/slice/appointment.slice";
import { format } from "date-fns";

const AppointmentDetailsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const appointment = useSelector((state: RootState) =>
    selectAppointmentById(state, id as string)
  );

  const handleJoinCall = () => {
    router.push({
      pathname: "/appointments/call",
      params: { appointmentId: id },
    });
  };

  const handleCancelAppointment = async () => {
    try {
      await dispatch(
        updateAppointment({
          id: id as string,
          data: { status: "cancelled" },
        })
      ).unwrap();
      router.back();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const handleViewPrescription = () => {
    if (appointment?.prescriptionId) {
      router.push({
        pathname: "/prescriptions/[id]",
        params: { id: appointment.prescriptionId },
      });
    }
  };

  if (!appointment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type="h1">{t("appointments.details")}</CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <CustomText type="h2">{t("appointments.doctorInfo")}</CustomText>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <CustomText type="body3">Dr. {appointment.doctorName}</CustomText>
              <CustomText type="body4">{appointment.doctorSpecialty}</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <CustomText type="h2">{t("appointments.appointmentInfo")}</CustomText>
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <CustomText type="body3">
                {format(new Date(appointment.date), "MMMM dd, yyyy")}
              </CustomText>
              <CustomText type="body4">
                {format(new Date(appointment.time), "hh:mm a")}
              </CustomText>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="description" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <CustomText type="body3">{t("appointments.reason")}</CustomText>
              <CustomText type="body4">{appointment.reason}</CustomText>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons
              name={
                appointment.status === "confirmed"
                  ? "check-circle"
                  : appointment.status === "pending"
                  ? "hourglass-empty"
                  : appointment.status === "completed"
                  ? "check-circle"
                  : "cancel"
              }
              size={24}
              color={
                appointment.status === "confirmed"
                  ? COLORS.primary
                  : appointment.status === "pending"
                  ? COLORS.warning
                  : appointment.status === "completed"
                  ? COLORS.primary
                  : COLORS.danger
              }
            />
            <View style={styles.infoContent}>
              <CustomText type="body3">{t("appointments.status")}</CustomText>
              <CustomText type="body4">
                {t(`appointments.status.${appointment.status}`)}
              </CustomText>
            </View>
          </View>
        </View>

        {appointment.status === "completed" && appointment.prescriptionId && (
          <View style={styles.section}>
            <CustomText type="h2">{t("appointments.prescription")}</CustomText>
            <View style={styles.infoItem}>
              <MaterialIcons name="medication" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <CustomText type="body3">
                  {t("appointments.prescriptionAvailable")}
                </CustomText>
                <AppButton
                  title={t("appointments.viewPrescription")}
                  onPress={handleViewPrescription}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {appointment.status === "confirmed" && (
          <AppButton
            title={t("appointments.joinCall")}
            onPress={handleJoinCall}
          />
        )}
        {appointment.status !== "cancelled" &&
          appointment.status !== "completed" && (
            <AppButton
              title={t("appointments.cancel")}
              backgroundColor={COLORS.danger}
              onPress={handleCancelAppointment}
            />
          )}
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
  section: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginTop: 10,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
});

export default AppointmentDetailsScreen; 