import React, { useState } from "react";
import { View, StyleSheet, Button, ScrollView, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { IDoctor } from "@/constants/types";
import { AppButton, AuthInputField, AuthSelectField, MultiSelect } from "@/components";
import { COLORS } from "@/constants/theme";
import colors from "@/constants/Colors";

const options = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
  { label: "Option 4", value: "option4" },
];

const DoctorRegistrationScreen: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleSelect = (selectedValues: string[]) => {
    setSelectedValues(selectedValues);
  };
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
      <KeyboardAvoidingView>
        <AuthInputField
          name="specialization"
          label="Specialization"
          placeholder="Enter your specialization"
          // onChangeText={(value) => handleInputChange("specialization", value)}
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
        <MultiSelect
          options={options}
          selectedValues={selectedValues}
          onSelect={handleSelect}
          containerStyle={styles.multiSelect}
        />
        <AppButton
          containerStyle={{ marginTop: 24 }}
          title="Submit"
          onPress={handleSubmit}
          width={"100%"}
          backgroundColor={COLORS.primary}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  multiSelect: {
    width: "100%",
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    height: 45,
    borderRadius: 25,
    color: COLORS.primary,
    padding: 10,
    textAlign: "left",
    marginVertical:12,
    zIndex:99
  },
});

export default DoctorRegistrationScreen;
