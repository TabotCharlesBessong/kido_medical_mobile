import React, { useState } from "react";
import { View, StyleSheet, Button, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { IPatient } from "@/constants/types";
import { AuthInputField } from "@/components";

const CompleteScreen: React.FC = () => {
  const [patientData, setPatientData] = useState<IPatient>({
    id: "",
    userId: "",
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phone: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const router = useRouter();

  const handleInputChange = (name: keyof IPatient, value: string | number) => {
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log(patientData);
    // Submit data logic
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthInputField
        name="gender"
        label="Gender"
        placeholder="Enter your gender"
        // onChangeText={(value:string) => handleInputChange("gender", value)}
      />
      <AuthInputField
        name="age"
        label="Age"
        placeholder="Enter your age"
        keyboardType="numeric"
        // onChangeText={(value) => handleInputChange("age", Number(value))}
      />
      <AuthInputField
        name="address1"
        label="City"
        placeholder="Enter your city"
        // onChangeText={(value) => handleInputChange("address1", value)}
      />
      <AuthInputField
        name="address2"
        label="Quarter"
        placeholder="Enter your quarter"
        // onChangeText={(value) => handleInputChange("address2", value)}
      />
      <AuthInputField
        name="occupation"
        label="Occupation"
        placeholder="Enter your occupation"
        // onChangeText={(value) => handleInputChange("occupation", value)}
      />
      <AuthInputField
        name="phone"
        label="Phone"
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        // onChangeText={(value) => handleInputChange("phone", Number(value))}
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

export default CompleteScreen;
