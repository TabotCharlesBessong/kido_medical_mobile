import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { IPrescription } from "@/constants/types";

const PrescriptionDetailsScreen: React.FC = () => {
  const { prescription } = useLocalSearchParams<{
    prescription: IPrescription;
  }>();

  if (!prescription) {
    return <CustomText type="h1" >Prescription not found.</CustomText>;
  }

  return (
    <ScrollView style={styles.container}>
      <CustomText type="h2">Doctor: {prescription.doctorName}</CustomText>
      <CustomText type="h4" >Patient: {prescription.patientName}</CustomText>
      <CustomText type="h4" >
        Instructions: {prescription.instructions || "None"}
      </CustomText>
      <CustomText type="h4" >
        Investigation: {prescription.investigation || "None"}
      </CustomText>
      <CustomText type="h2">Medications:</CustomText>
      {prescription?.medications?.map((med) => (
        <View key={med.id} style={styles.medicationCard}>
          <CustomText type="h4" >Name: {med.name}</CustomText>
          <CustomText type="h4" >Dosage: {med.dosage}</CustomText>
          <CustomText type="h4" >Frequency: {med.frequency}</CustomText>
          <CustomText type="h4" >Duration: {med.duration} days</CustomText>
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
