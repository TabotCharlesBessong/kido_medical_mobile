import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchDoctorAppointments,
  approveAppointment,
  clearAppointmentError,
} from "@/redux/slice/appointmentSlice";
import { initiateCall } from "@/redux/slice/callSlice"; // NEW: Import initiateCall thunk
import { AppButton, CustomText } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { format, isBefore, addMinutes } from "date-fns"; // For time window checks
import { Appointment, AppointmentStatus } from "@/constants/types/appointment";

const DoctorAppointmentsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { doctorAppointments, isLoading, error } = useSelector(
    (state: RootState) => state.appointment
  );
  const { callStatus: currentCallStatus, callError: callInitError } =
    useSelector((state: RootState) => state.call); // Monitor call initiation status

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearAppointmentError());
    }
    if (callInitError) {
      Alert.alert(t("common.error"), callInitError);
      // You might want a clearCallError() here if you have one
    }
  }, [error, callInitError, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDoctorAppointments());
    setRefreshing(false);
  }, [dispatch]);

  const handleUpdateStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    Alert.alert(
      t("doctorAppointments.confirmTitle"),
      t("doctorAppointments.confirmMessage", { status: status.toLowerCase() }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: async () => {
            const resultAction = await dispatch(
              approveAppointment({ appointmentId, status })
            );
            if (approveAppointment.fulfilled.match(resultAction)) {
              Alert.alert(
                t("common.success"),
                t("doctorAppointments.statusUpdateSuccess")
              );
            }
          },
        },
      ]
    );
  };

  const handleRecordConsultation = (
    appointmentId: string,
    patientName: string
  ) => {
    Alert.alert(
      t("doctorAppointments.recordConsultationTitle"),
      t("doctorAppointments.recordConsultationPrompt", { patientName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.proceed"),
          onPress: () =>
            router.push({
              // @ts-ignore
              pathname: "/doctor/record-consultation",
              params: { appointmentId },
            }),
        },
      ]
    );
  };

  const handleStartCall = async (
    appointmentId: string,
    patientName: string
  ) => {
    // Optional: Add logic to check if it's too early/late for the call based on appointment time
    const appointment = doctorAppointments.find(
      (app) => app.id === appointmentId
    );
    if (!appointment || !appointment.timeslot) {
      Alert.alert(t("common.error"), t("call.appointmentDetailsMissing"));
      return;
    }

    const appointmentStart = new Date(
      `${appointment.date}T${appointment.timeslot.startTime}:00`
    );
    const now = new Date();
    const canStartBefore = addMinutes(appointmentStart, -5); // Can start 5 mins before
    const canStartAfter = addMinutes(appointmentStart, 15); // Can start up to 15 mins after

    if (isBefore(now, canStartBefore)) {
      Alert.alert(
        t("call.tooEarlyTitle"),
        t("call.tooEarlyMessage", { time: format(appointmentStart, "p") })
      );
      return;
    }
    if (isBefore(canStartAfter, now)) {
      Alert.alert(t("call.tooLateTitle"), t("call.tooLateMessage"));
      return;
    }

    Alert.alert(
      t("doctorAppointments.startCallTitle"),
      t("doctorAppointments.startCallPrompt", { patientName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.proceed"),
          onPress: async () => {
            // Dispatch the action to initiate the call via backend
            const resultAction = await dispatch(
              initiateCall({ appointmentId })
            );
            if (
              initiateCall.fulfilled.match(resultAction) &&
              resultAction.payload.data
            ) {
              const { channelId } = resultAction.payload.data;
              // Navigate to the Stream call screen with the Stream call ID (channelId)
              router.push({
                // @ts-ignore
                pathname: `/calls/[streamCallId]`,
                params: { streamCallId: channelId },
              });
            } else {
              Alert.alert(
                t("common.error"),
                (resultAction.payload as string) || t("call.initiateFailed")
              );
            }
          },
        },
      ]
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <CustomText type="h4" style={styles.cardHeader}>
        {t("doctorAppointments.appointmentWith")}
        {item.patient?.firstname} {item.patient?.lastname}
      </CustomText>
      <CustomText type="body3">
        {t("doctorAppointments.date")}:{" "}
        {new Date(item.date).toLocaleDateString()}
      </CustomText>
      {item.timeslot && (
        <CustomText type="body3">
          {t("doctorAppointments.time")}:{" "}
          {new Date(item.timeslot.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {new Date(item.timeslot.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </CustomText>
      )}
      <CustomText type="body3">
        {t("doctorAppointments.reason")}: {item.reason}
      </CustomText>
      <CustomText type="body3">
        {t("doctorAppointments.status")}:{" "}
        <Text
          style={{
            color:
              item.status === "PENDING"
                ? COLORS.warning
                : item.status === "APPROVED"
                ? COLORS.success
                : COLORS.danger,
          }}
        >
          {item.status}
        </Text>
      </CustomText>

      {item.status === "PENDING" && (
        <View style={styles.buttonContainer}>
          <AppButton
            title={t("doctorAppointments.approveButton")}
            onPress={() => handleUpdateStatus(item.id, "APPROVED")}
            backgroundColor={COLORS.success}
            containerStyle={styles.actionButton}
            loading={isLoading}
            loadingText={t("common.loading")}
          />
          <AppButton
            title={t("doctorAppointments.rejectButton")}
            onPress={() => handleUpdateStatus(item.id, "REJECTED")}
            backgroundColor={COLORS.danger}
            containerStyle={styles.actionButton}
            loading={isLoading}
            loadingText={t("common.loading")}
          />
        </View>
      )}
      {item.status === "APPROVED" && (
        <View style={styles.buttonContainerTwo}>
          {" "}
          {/* Use a new style for these two buttons */}
          {/* Start Call Button */}
          <AppButton
            title={t("doctorAppointments.startCallButton")}
            onPress={() =>
              handleStartCall(item.id, item.patient?.firstname || "Patient")
            }
            backgroundColor={COLORS.accent}
            containerStyle={styles.actionButton}
            loading={currentCallStatus === "initiating"} // Link to call initiation loading
            loadingText={t("call.startingCall")}
          />
          {/* Record Consultation Button */}
          <AppButton
            title={t("doctorAppointments.recordConsultationButton")}
            onPress={() =>
              handleRecordConsultation(
                item.id,
                item.patient?.firstname || "Patient"
              )
            }
            backgroundColor={COLORS.primary}
            containerStyle={styles.actionButton}
            loading={isLoading} // Optional: link to general loading
          />
        </View>
      )}
    </View>
  );

  if (isLoading && doctorAppointments.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingAppointments")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>
        {t("doctorAppointments.title")}
      </CustomText>
      {doctorAppointments.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("doctorAppointments.noAppointments")}
          </CustomText>
          <AppButton
            title={t("common.refresh")}
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: "50%" }}
          />
        </View>
      ) : (
        <FlatList
          data={doctorAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default DoctorAppointmentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#F7F7F7",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text || "#333",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray || "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
    color: COLORS.dark || "#333",
  },
  buttonContainer: {
    // For Pending (Approve/Reject)
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  buttonContainerTwo: {
    // For Approved (Start Call/Record)
    flexDirection: "row",
    justifyContent: "space-between", // Changed to space-between
    marginTop: 15,
  },
  actionButton: {
    width: "48%", // Adjusted for two buttons side-by-side
    height: 40,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray || "#666",
    textAlign: "center",
  },
});
