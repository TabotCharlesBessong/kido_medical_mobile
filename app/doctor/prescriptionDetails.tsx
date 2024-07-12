import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { IPrescription } from "@/constants/types";
import { useTranslation } from "react-i18next";

const PrescriptionDetailsScreen: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const { prescription } = useLocalSearchParams<{
    prescription: IPrescription;
  }>();

  if (!prescription) {
    return (
      <CustomText type="h1">
        {t("prescriptionDetails.notFound")}
      </CustomText>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <CustomText type="h2">{`${t("prescriptionDetails.doctor")} ${
        prescription.doctorName
      }`}</CustomText>
      <CustomText type="h4">{`${t("prescriptionDetails.patient")} ${
        prescription.patientName
      }`}</CustomText>
      <CustomText type="h4">{`${t(
        "prescriptionDetails.instructions"
      )} ${
        prescription.instructions || t("prescriptionDetails.none")
      }`}</CustomText>
      <CustomText type="h4">{`${t(
        "prescriptionDetails.investigation"
      )} ${
        prescription.investigation || t("prescriptionDetails.none")
      }`}</CustomText>
      <CustomText type="h2">
        {t("prescriptionDetails.medications")}
      </CustomText>
      {prescription?.medications?.map((med) => (
        <View key={med.id} style={styles.medicationCard}>
          <CustomText type="h4">{`${t(
            "prescriptionDetails.medicationName"
          )} ${med.name}`}</CustomText>
          <CustomText type="h4">{`${t("prescriptionDetails.dosage")} ${
            med.dosage
          }`}</CustomText>
          <CustomText type="h4">{`${t(
            "prescriptionDetails.frequency"
          )} ${med.frequency}`}</CustomText>
          <CustomText type="h4">{`${t(
            "prescriptionDetails.durationPrefix"
          )} ${med.duration} ${t(
            "prescriptionDetails.daysSuffix"
          )}`}</CustomText>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  medicationCard: {
    backgroundColor: COLORS.secondaryGray,
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default PrescriptionDetailsScreen;
