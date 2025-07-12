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
  fetchPatientAppointments,
  clearAppointmentError,
} from "@/redux/slice/appointmentSlice";
import { Appointment } from "@/constants/types/appointment";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";

const PatientAppointmentsScreen = () => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { patientAppointments, isLoading, error } = useSelector(
    (state: RootState) => state.appointment
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPatientAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearAppointmentError());
    }
  }, [error, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPatientAppointments());
    setRefreshing(false);
  }, [dispatch]);

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <CustomText type="h4" style={styles.cardHeader}>
        {t("patientAppointments.appointmentWith")}: {item.doctor?.firstname}{" "}
        {item.doctor?.lastname}
      </CustomText>
      <CustomText type="body3">
        {t("patientAppointments.date")}:{" "}
        {new Date(item.date).toLocaleDateString()}
      </CustomText>
      {item.timeslot && (
        <CustomText type="body3">
          {t("patientAppointments.time")}:{" "}
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
        {t("patientAppointments.reason")}: {item.reason}
      </CustomText>
      <CustomText type="body3">
        {t("patientAppointments.status")}:{" "}
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
      {/* Optional: Button to cancel appointment if status is PENDING/APPROVED */}
      {/* {item.status === 'PENDING' && (
        <AppButton
          title={t('patientAppointments.cancelButton')}
          onPress={() => Alert.alert('Cancel Appointment', `Confirm cancellation for ID: ${item.id}`)}
          backgroundColor={COLORS.danger}
          containerStyle={styles.cancelButton}
        />
      )} */}
    </View>
  );

  if (isLoading && patientAppointments.length === 0 && !error) {
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
        {t("patientAppointments.title")}
      </CustomText>
      {patientAppointments.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("patientAppointments.noAppointments")}
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
          data={patientAppointments}
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

export default PatientAppointmentsScreen;

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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray || "#666",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 15,
    width: "50%",
    alignSelf: "center",
  },
});
