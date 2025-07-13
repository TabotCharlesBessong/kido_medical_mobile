import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSinglePrescription, // Assuming this thunk can fetch for patient as well
  clearPrescriptionError,
  clearCurrentPrescription,
} from "@/redux/slice/prescriptionSlice";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MedicationFrequency } from "@/constants/types/prescription";

const PatientPrescriptionDetailViewScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { prescriptionId } = useLocalSearchParams<{ prescriptionId: string }>();

  const { currentPrescription, isLoading, error } = useSelector(
    (state: RootState) => state.prescription
  );

  useEffect(() => {
    if (prescriptionId) {
      dispatch(fetchSinglePrescription(prescriptionId));
    }
    return () => {
      dispatch(clearCurrentPrescription());
      dispatch(clearPrescriptionError());
    };
  }, [dispatch, prescriptionId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearPrescriptionError());
    }
  }, [error, dispatch, t]);

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

  if (isLoading && !currentPrescription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingPrescriptionDetails")}
        </CustomText>
      </View>
    );
  }

  if (!currentPrescription) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>
          {t("prescription.prescriptionNotFound")}
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>
          {t("patientRecords.prescriptionDetailTitle")}
        </CustomText>

        <View style={styles.detailCard}>
          <CustomText type="h4" style={styles.cardHeader}>
            {t("patientRecords.prescriptionFrom")}:{" "}
            {currentPrescription.doctor?.firstname || "N/A"}{" "}
            {currentPrescription.doctor?.lastname || "Doctor"}
          </CustomText>
          <CustomText type="body3">
            {t("patientRecords.dateIssued")}:{" "}
            {new Date(currentPrescription.createdAt).toLocaleString()}
          </CustomText>
          <CustomText type="body3">
            {t("prescription.instructionsLabel")}:{" "}
            {currentPrescription.instructions}
          </CustomText>
          <CustomText type="body3">
            {t("prescription.investigationLabel")}:{" "}
            {currentPrescription.investigation}
          </CustomText>
        </View>

        <CustomText type="h3" style={styles.medicationsSectionHeader}>
          {t("prescription.medicationsSection")}
        </CustomText>
        {currentPrescription.medications.map((med, idx) => (
          <View key={idx} style={styles.medicationItem}>
            <CustomText type="body3" style={styles.medicationName}>
              {med.name}
            </CustomText>
            <CustomText type="body4">
              {t("prescription.dosageLabel")}: {med.dosage}
            </CustomText>
            <CustomText type="body4">
              {t("prescription.frequency")}:{" "}
              {getFrequencyTranslation(med.frequency)}
            </CustomText>
            <CustomText type="body4">
              {t("prescription.duration")}: {med.duration}{" "}
              {t("prescription.days")}
            </CustomText>
          </View>
        ))}

        <AppButton
          title={t("common.goBack")}
          onPress={() => router.back()}
          backgroundColor={COLORS.primary}
          containerStyle={styles.backButton}
        />
      </ScrollView>
    </View>
  );
};

export default PatientPrescriptionDetailViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
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
  detailCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    maxWidth: 450,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    alignSelf: "center",
  },
  cardHeader: {
    marginBottom: 10,
    color: COLORS.dark,
  },
  medicationsSectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
    color: COLORS.primary,
  },
  medicationItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  medicationName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  backButton: {
    marginTop: 30,
    width: "80%",
    alignSelf: "center",
  },
});
