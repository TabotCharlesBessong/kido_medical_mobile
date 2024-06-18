import React, { useState } from "react";
import { View, StyleSheet, Button, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { IDoctor } from "@/constants/types";
import { AuthInputField, AuthSelectField } from "@/components";

const DoctorRegistrationScreen: React.FC = () => {
  const [doctorData, setDoctorData] = useState<IDoctor>({
    id: "",
    userId: "",
    specialization: "",
    verificationStatus: "",
    documents: "",
    experience: 0,
    fee: 0,
    language: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const router = useRouter();

  const handleInputChange = (
    name: keyof IDoctor,
    value: string | number | string[]
  ) => {
    setDoctorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log(doctorData);
    // Submit data logic
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthInputField
        name="specialization"
        label="Specialization"
        placeholder="Enter your specialization"
        // onChangeText={(value) => handleInputChange("specialization", value)}
      />
      <AuthInputField
        name="verificationStatus"
        label="Verification Status"
        placeholder="Enter your verification status"
        // onChangeText={(value) => handleInputChange("verificationStatus", value)}
      />
      <AuthInputField
        name="documents"
        label="Documents"
        placeholder="Enter your documents"
        // onChangeText={(value) => handleInputChange("documents", value)}
      />
      <AuthInputField
        name="experience"
        label="Experience"
        placeholder="Enter your experience"
        keyboardType="numeric"
        // onChangeText={(value) => handleInputChange("experience", Number(value))}
      />
      <AuthInputField
        name="fee"
        label="Fee"
        placeholder="Enter your fee"
        keyboardType="numeric"
        // onChangeText={(value) => handleInputChange("fee", Number(value))}
      />
      <AuthSelectField
        name="language"
        label="Language"
        placeholder="Select languages"
        options={[
          { label: "English", value: "English" },
          { label: "French", value: "French" },
          { label: "Spanish", value: "Spanish" },
          { label: "German", value: "German" },
        ]}
        // onValueChange={(value) => handleInputChange("language", value)}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default DoctorRegistrationScreen;
