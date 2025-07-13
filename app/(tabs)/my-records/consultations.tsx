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
  fetchPatientConsultations,
  clearConsultationError,
} from "@/redux/slice/consultationSlice";
import { Consultation } from "@/constants/types/consultation";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const MyPatientConsultationsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { patientConsultations, isLoading, error } = useSelector(
    (state: RootState) => state.consultation
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPatientConsultations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearConsultationError());
    }
  }, [error, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPatientConsultations());
    setRefreshing(false);
  }, [dispatch]);

  const handleViewConsultation = (consultation: Consultation) => {
    // Navigate to a read-only consultation detail screen for patients
    router.push({
      // @ts-ignore
      pathname: "/my-records/consultation-detail-view",
      params: { consultationId: consultation.id },
    });
  };

  const renderConsultationItem = ({ item }: { item: Consultation }) => (
    <View style={styles.consultationCard}>
      <CustomText type="h4" style={styles.cardHeader}>
        {t("patientRecords.consultationWith")}:{" "}
        {item.doctor?.firstname || "N/A"} {item.doctor?.lastname || "Doctor"}
      </CustomText>
      <CustomText type="body3">
        {t("patientRecords.date")}:{" "}
        {new Date(item.createdAt).toLocaleDateString()}
      </CustomText>
      <CustomText type="body3">
        {t("patientRecords.complaints")}:{" "}
        {item.presentingComplaints.substring(0, 70)}...
      </CustomText>
      <CustomText type="body3">
        {t("patientRecords.diagnosis")}:{" "}
        {item.diagnosticImpression.substring(0, 70)}...
      </CustomText>

      <AppButton
        title={t("common.viewDetails")}
        onPress={() => handleViewConsultation(item)}
        backgroundColor={COLORS.primary}
        containerStyle={styles.viewButton}
        titleStyle={styles.viewButtonTitle}
      />
    </View>
  );

  if (isLoading && patientConsultations.length === 0 && !error) {
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
        {t("patientRecords.myConsultationsTitle")}
      </CustomText>
      {patientConsultations.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("patientRecords.noConsultations")}
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
          data={patientConsultations}
          keyExtractor={(item) => item.id}
          renderItem={renderConsultationItem}
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

export default MyPatientConsultationsScreen;

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
  consultationCard: {
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
