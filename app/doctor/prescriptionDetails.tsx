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
        {t("screens.prescriptionDetails.notFound")}
      </CustomText>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <CustomText type="h2">{`${t("screens.prescriptionDetails.doctor")} ${
        prescription.doctorName
      }`}</CustomText>
      <CustomText type="h4">{`${t("screens.prescriptionDetails.patient")} ${
        prescription.patientName
      }`}</CustomText>
      <CustomText type="h4">{`${t(
        "screens.prescriptionDetails.instructions"
      )} ${
        prescription.instructions || t("screens.prescriptionDetails.none")
      }`}</CustomText>
      <CustomText type="h4">{`${t(
        "screens.prescriptionDetails.investigation"
      )} ${
        prescription.investigation || t("screens.prescriptionDetails.none")
      }`}</CustomText>
      <CustomText type="h2">
        {t("screens.prescriptionDetails.medications")}
      </CustomText>
      {prescription?.medications?.map((med) => (
        <View key={med.id} style={styles.medicationCard}>
          <CustomText type="h4">{`${t(
            "screens.prescriptionDetails.medicationName"
          )} ${med.name}`}</CustomText>
          <CustomText type="h4">{`${t("screens.prescriptionDetails.dosage")} ${
            med.dosage
          }`}</CustomText>
          <CustomText type="h4">{`${t(
            "screens.prescriptionDetails.frequency"
          )} ${med.frequency}`}</CustomText>
          <CustomText type="h4">{`${t(
            "screens.prescriptionDetails.durationPrefix"
          )} ${med.duration} ${t(
            "screens.prescriptionDetails.daysSuffix"
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
