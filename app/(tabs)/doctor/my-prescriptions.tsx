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
  fetchDoctorPrescriptions,
  clearPrescriptionError,
} from "@/redux/slice/prescriptionSlice";
import { Prescription, MedicationFrequency } from "@/constants/types/prescription";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const MyDoctorPrescriptionsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { doctorPrescriptions, isLoading, error } = useSelector(
    (state: RootState) => state.prescription
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorPrescriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearPrescriptionError());
    }
  }, [error, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDoctorPrescriptions());
    setRefreshing(false);
  }, [dispatch]);

  const getFrequencyTranslation = (frequency: MedicationFrequency) => {
    switch (frequency) {
      case "ONCE_A_DAY":
        return t("prescription.frequencyOnceADay");
      case "TWICE_A_DAY":
        return t("prescription.frequencyTwiceADay");
      case "THRICE_A_DAY":
        return t("prescription.frequencyThriceADay");
      case "FOUR_TIMES_A_DAY":
        return t("prescription.frequencyFourTimesADay");
      case "AS_NEEDED":
        return t("prescription.frequencyAsNeeded");
      default:
        return frequency;
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    router.push({
      // @ts-ignore
      pathname: "/doctor/prescription-detail",
      params: { prescriptionId: prescription.id },
    });
  };

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
    <View style={styles.prescriptionCard}>
      <CustomText type="h4" style={styles.cardHeader}>
        {t("prescription.forPatient")}: {item.patient?.firstname || "N/A"}{" "}
        {item.patient?.lastname || "Patient"}
      </CustomText>
      <CustomText type="body3">
        {t("prescription.dateIssued")}:{" "}
        {new Date(item.createdAt).toLocaleDateString()}
      </CustomText>
      <CustomText type="body3">
        {t("prescription.instructionsLabel")}:{" "}
        {item.instructions.substring(0, 70)}...
      </CustomText>

      <CustomText type="body1" style={styles.medicationsSubHeader}>
        {t("prescription.medicationsSection")}:
      </CustomText>
      {item.medications.slice(0, 2).map(
        (
          med,
          idx // Show first 2 medications as a preview
        ) => (
          <View key={idx} style={styles.medicationItem}>
            <CustomText type="body4" style={styles.medicationName}>
              {med.name} - {med.dosage}
            </CustomText>
          </View>
        )
      )}
      {item.medications.length > 2 && (
        <CustomText type="body4" style={styles.moreMedicationsText}>
          {t("prescription.andMore", { count: item.medications.length - 2 })}
        </CustomText>
      )}

      <AppButton
        title={t("common.viewDetails")}
        onPress={() => handleViewPrescription(item)}
        backgroundColor={COLORS.primary}
        containerStyle={styles.viewButton}
        titleStyle={styles.viewButtonTitle}
      />
    </View>
  );

  if (isLoading && doctorPrescriptions.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingRecords")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>
        {t("prescription.myIssuedPrescriptionsTitle")}
      </CustomText>
      {doctorPrescriptions.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("prescription.noIssuedPrescriptions")}
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
          data={doctorPrescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderPrescriptionItem}
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

export default MyDoctorPrescriptionsScreen;

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
  prescriptionCard: {
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
  medicationsSubHeader: {
    marginTop: 10,
    marginBottom: 5,
    color: COLORS.dark || "#333",
  },
  medicationItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 8,
    marginBottom: 5,
  },
  medicationName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  moreMedicationsText: {
    fontStyle: "italic",
    color: COLORS.gray,
    marginTop: 5,
    textAlign: "center",
  },
  viewButton: {
    marginTop: 15,
    width: "50%",
    alignSelf: "center",
    height: 40,
    borderRadius: 20,
  },
  viewButtonTitle: {
    fontSize: 14,
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
