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
  fetchDoctorConsultations,
  deleteConsultation,
  clearConsultationError,
} from "@/redux/slice/consultationSlice";
import { Consultation } from "@/constants/types/consultation";
import { AppButton, CustomText } from "@/components";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { COLORS } from "@/utils/constants";

const MyDoctorConsultationsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { doctorConsultations, isLoading, error } = useSelector(
    (state: RootState) => state.consultation
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorConsultations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearConsultationError());
    }
  }, [error, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDoctorConsultations());
    setRefreshing(false);
  }, [dispatch]);

  const handleDeleteConsultation = async (consultationId: string) => {
    Alert.alert(
      t("consultation.deleteConfirmTitle"),
      t("consultation.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const resultAction = await dispatch(
              deleteConsultation(consultationId)
            );
            if (deleteConsultation.fulfilled.match(resultAction)) {
              Alert.alert(t("common.success"), t("consultation.deleteSuccess"));
              // Redux reducer automatically removes from state
            }
          },
        },
      ]
    );
  };

  const handleViewConsultation = (consultation: Consultation) => {
    router.push({
      // @ts-ignore
      pathname: "/doctor/consultation-detail",
      params: { consultationId: consultation.id },
    });
  };

  const renderConsultationItem = ({ item }: { item: Consultation }) => (
    <View style={styles.consultationCard}>
      <CustomText type="h4" style={styles.cardHeader}>
        {t("consultation.forPatient")}: {item.patient?.firstname || "Unknown"}{" "}
        {item.patient?.lastname || "Patient"}
      </CustomText>
      <CustomText type="body3">
        {t("consultation.date")}:{" "}
        {new Date(item.createdAt).toLocaleDateString()}
      </CustomText>
      <CustomText type="body3">
        {t("consultation.complaints")}:{" "}
        {item.presentingComplaints.substring(0, 70)}...
      </CustomText>
      <CustomText type="body3">
        {t("consultation.diagnosis")}:{" "}
        {item.diagnosticImpression.substring(0, 70)}...
      </CustomText>

      <View style={styles.buttonContainer}>
        <AppButton
          title={t("common.view")}
          onPress={() => handleViewConsultation(item)}
          backgroundColor={COLORS.primary}
          containerStyle={styles.actionButton}
          titleStyle={styles.actionButtonTitle}
        />
        <AppButton
          title={t("common.delete")}
          onPress={() => handleDeleteConsultation(item.id)}
          backgroundColor={COLORS.danger}
          containerStyle={styles.actionButton}
          titleStyle={styles.actionButtonTitle}
        />
        <AppButton
          title={t("prescription.createButton")}
          onPress={() =>
            router.push({
              // @ts-ignore
              pathname: "/doctor/create-prescription",
              params: { consultationId: item.id },
            })
          }
          backgroundColor={COLORS.secondary}
          containerStyle={styles.actionButton}
          titleStyle={styles.actionButtonTitle}
        />
      </View>
    </View>
  );

  if (isLoading && doctorConsultations.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingConsultations")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>
        {t("consultation.myConsultationsTitle")}
      </CustomText>
      {doctorConsultations.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("consultation.noConsultations")}
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
          data={doctorConsultations}
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

export default MyDoctorConsultationsScreen;

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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed to space-between
    marginTop: 15,
  },
  actionButton: {
    width: "32%", // Adjust width for 3 buttons
    height: 40,
    borderRadius: 20,
  },
  actionButtonTitle: {
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
