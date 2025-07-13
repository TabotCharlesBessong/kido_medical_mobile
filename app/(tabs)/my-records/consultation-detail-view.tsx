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
  fetchSingleConsultation,
  clearConsultationError,
  clearCurrentConsultation,
} from "@/redux/slice/consultationSlice";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";

const PatientConsultationDetailViewScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();

  const { currentConsultation, isLoading, error } = useSelector(
    (state: RootState) => state.consultation
  );

  useEffect(() => {
    if (consultationId) {
      // Patients also use fetchSingleConsultation (assuming it works for patient's own records)
      // or you might need a separate patient-specific endpoint like /patient/record/consultation/:id
      dispatch(fetchSingleConsultation(consultationId));
    }
    return () => {
      dispatch(clearCurrentConsultation());
      dispatch(clearConsultationError());
    };
  }, [dispatch, consultationId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearConsultationError());
    }
  }, [error, dispatch, t]);

  if (isLoading && !currentConsultation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingConsultationDetails")}
        </CustomText>
      </View>
    );
  }

  if (!currentConsultation) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>
          {t("consultation.consultationNotFound")}
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
          {t("patientRecords.consultationDetailTitle")}
        </CustomText>

        <View style={styles.detailCard}>
          <CustomText type="h4" style={styles.cardHeader}>
            {t("patientRecords.consultationWith")}:{" "}
            {currentConsultation.doctor?.firstname || "N/A"}{" "}
            {currentConsultation.doctor?.lastname || "Doctor"}
          </CustomText>
          <CustomText type="body3">
            {t("patientRecords.date")}:{" "}
            {new Date(currentConsultation.createdAt).toLocaleString()}
          </CustomText>
        </View>

        <View style={styles.section}>
          <CustomText type="h3" style={styles.sectionHeader}>
            {t("consultation.complaintsLabel")}
          </CustomText>
          <CustomText type="body3">
            {currentConsultation.presentingComplaints}
          </CustomText>
        </View>

        <View style={styles.section}>
          <CustomText type="h3" style={styles.sectionHeader}>
            {t("consultation.diagnosisLabel")}
          </CustomText>
          <CustomText type="body3">
            {currentConsultation.diagnosticImpression}
          </CustomText>
        </View>

        <View style={styles.section}>
          <CustomText type="h3" style={styles.sectionHeader}>
            {t("consultation.investigationsLabel")}
          </CustomText>
          <CustomText type="body3">
            {currentConsultation.investigations}
          </CustomText>
        </View>

        <View style={styles.section}>
          <CustomText type="h3" style={styles.sectionHeader}>
            {t("consultation.treatmentLabel")}
          </CustomText>
          <CustomText type="body3">{currentConsultation.treatment}</CustomText>
        </View>

        <View style={styles.section}>
          <CustomText type="h3" style={styles.sectionHeader}>
            {t("consultation.pastHistoryLabel")}
          </CustomText>
          <CustomText type="body3">
            {currentConsultation.pastHistory}
          </CustomText>
        </View>

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

export default PatientConsultationDetailViewScreen;

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
  },
  cardHeader: {
    marginBottom: 10,
    color: COLORS.dark,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 8,
    color: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 5,
  },
  backButton: {
    marginTop: 30,
    width: "80%",
    alignSelf: "center",
  },
});
