import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { baseUrl } from "@/utils/variables";
import { IPrescription } from "@/constants/types";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { generatePrescription } from "@/constants/data/prescription";

const PrescriptionsScreen: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        // Simulating fetch with delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Replace with actual fetch from API
        // const response = await axios.get(`${baseUrl}/prescriptions`);
        // setPrescriptions(response.data.data);

        const prescriptionData = generatePrescription(12); // Replace with actual API call
        setPrescriptions(prescriptionData);
        setLoading(false);
      } catch (error) {
        setErrorMessage("Failed to fetch prescriptions.");
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const renderItem = ({ item }: { item: IPrescription }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/doctor/prescriptionDetails",
          params: { prescription: JSON.stringify(item) },
        })
      }
    >
      <CustomText type="h2">Doctor: {item.doctorName}</CustomText>
      <CustomText type="h4">Patient: {item.patientName}</CustomText>
      <CustomText type="h4">
        Instructions: {item.instructions || "None"}
      </CustomText>
      <CustomText type="h4">
        Investigation: {item.investigation || "None"}
      </CustomText>
      <CustomText type="h4">Medications:</CustomText>
      {item.medications.map((med) => (
        <CustomText type="h4" key={med.id}>
          {med.name}
        </CustomText>
      ))}
    </TouchableOpacity>
  );

  if (loading) {
    return <CustomText type="h4">Loading...</CustomText>;
  }

  if (errorMessage) {
    return <CustomText type="body5">{errorMessage}</CustomText>;
  }

  return (
    <FlatList
      data={prescriptions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default PrescriptionsScreen;
