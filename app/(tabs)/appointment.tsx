import React, { useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
  fetchAppointments,
  updateAppointment,
  selectAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from "@/redux/slice/appointment.slice";
import { format } from "date-fns";

const AppointmentsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const appointments = useSelector(selectAppointments);
  const loading = useSelector(selectAppointmentsLoading);
  const error = useSelector(selectAppointmentsError);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== "cancelled"
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < new Date() || apt.status === "cancelled"
  );

  const handleAppointmentDetails = (appointment: any) => {
    router.push({
      pathname: "/appointments/[id]",
      params: { id: appointment.id },
    });
  };

  const handleNewAppointment = () => {
    router.push("/appointments/book");
  };

  const handleJoinCall = async (appointment: any) => {
    if (appointment.status === "confirmed") {
      router.push({
        pathname: "/appointments/call",
        params: { appointmentId: appointment.id },
      });
    }
  };

  const handleCancelAppointment = async (appointment: any) => {
    try {
      await dispatch(
        updateAppointment({
          id: appointment.id,
          data: { status: "cancelled" },
        })
      ).unwrap();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const renderAppointmentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item)}
    >
      <View style={styles.appointmentHeader}>
        <CustomText type="body3">Dr. {item.doctorName}</CustomText>
        <MaterialIcons
          name={
            item.status === "confirmed"
              ? "check-circle"
              : item.status === "pending"
              ? "hourglass-empty"
              : "cancel"
          }
          size={24}
          color={
            item.status === "confirmed"
              ? COLORS.primary
              : item.status === "pending"
              ? COLORS.warning
              : COLORS.danger
          }
        />
      </View>
      <CustomText type="body4">{item.doctorSpecialty}</CustomText>
      <CustomText type="body4">
        {format(new Date(item.date), "MMM dd, yyyy")} -{" "}
        {format(new Date(item.time), "hh:mm a")}
      </CustomText>
      <CustomText type="body4">{item.reason}</CustomText>
      <View style={styles.buttonContainer}>
        {item.status === "confirmed" && (
          <View style={{ width: "40%" }}>
            <AppButton
              title={t("appointments.joinCall")}
              onPress={() => handleJoinCall(item)}
            />
          </View>
        )}
        {item.status !== "cancelled" && (
          <View style={{ width: "40%" }}>
            <AppButton
              backgroundColor={COLORS.danger}
              title={t("appointments.cancel")}
              onPress={() => handleCancelAppointment(item)}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPastAppointmentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item)}
    >
      <View style={styles.appointmentHeader}>
        <CustomText type="body3">Dr. {item.doctorName}</CustomText>
        <MaterialIcons
          name={
            item.status === "completed"
              ? "check-circle"
              : item.status === "cancelled"
              ? "cancel"
              : "hourglass-empty"
          }
          size={24}
          color={
            item.status === "completed"
              ? COLORS.primary
              : item.status === "cancelled"
              ? COLORS.danger
              : COLORS.warning
          }
        />
      </View>
      <CustomText type="body4">{item.doctorSpecialty}</CustomText>
      <CustomText type="body4">
        {format(new Date(item.date), "MMM dd, yyyy")} -{" "}
        {format(new Date(item.time), "hh:mm a")}
      </CustomText>
      <CustomText type="body4">{item.reason}</CustomText>
      {item.status === "completed" && (
        <View style={{ display: "flex", alignSelf: "flex-end" }}>
          <View style={{ width: 150 }}>
            <AppButton
              title={t("appointments.viewPrescription")}
              onPress={() =>
                router.push({
                  pathname: "/prescriptions/[id]",
                  params: { id: item.prescriptionId },
                })
              }
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <CustomText type="body1" style={styles.errorText}>
          {error}
        </CustomText>
        <AppButton
          title={t("common.retry")}
          onPress={() => dispatch(fetchAppointments())}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type="h1">{t("appointments.title")}</CustomText>
        <TouchableOpacity onPress={handleNewAppointment}>
          <MaterialIcons
            name="add-circle-outline"
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <CustomText type="h2">{t("appointments.upcoming")}</CustomText>
      <FlatList
        data={upcomingAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.appointmentList}
        ListEmptyComponent={() => (
          <CustomText type="body1" style={styles.emptyText}>
            {t("appointments.noUpcoming")}
          </CustomText>
        )}
      />

      <CustomText type="h2">{t("appointments.past")}</CustomText>
      <FlatList
        data={pastAppointments}
        renderItem={renderPastAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.appointmentList}
        ListEmptyComponent={() => (
          <CustomText type="body1" style={styles.emptyText}>
            {t("appointments.noPast")}
          </CustomText>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  appointmentList: {
    marginBottom: 20,
  },
  appointmentItem: {
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 5,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
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
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 20,
  },
});

export default AppointmentsScreen;
