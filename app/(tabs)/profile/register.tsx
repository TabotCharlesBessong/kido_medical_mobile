import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { IDoctor, RegisterDoctorValues } from "@/constants/types";
import {
  AppButton,
  AuthInputField,
  AuthSelectField,
  MultiSelect,
} from "@/components";
import { COLORS } from "@/constants/theme";
import colors from "@/constants/Colors";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";

const options = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
  { label: "Option 4", value: "option4" },
];

const DoctorRegistrationScreen: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const initialValues: RegisterDoctorValues = {
    name: "",
    specialization: "",
    location: "",
    experience: 0,
    language: "",
    fee: 0,
    documents: "",
  };

  const doctorRegistrationSchema = yup.object({
    name: yup.string().required("Name is required"),
    specialization: yup.string().required("Speciality is required"),
    location: yup.string().required("Location is required"),
    documents: yup.string().required("Location is required"),
    experience: yup
      .number()
      .required("Experience is required")
      .min(0, "Experience must be a positive number"),
    language: yup.string().required("Language is required"),
    fee: yup
      .number()
      .required("Fee is required")
      .min(0, "Fee must be a positive number"),
  });

  const handleSelect = (selectedValues: string[]) => {
    setSelectedValues(selectedValues);
  };

  const router = useRouter();

  const handleSubmit = async (
    values: RegisterDoctorValues,
    actions: FormikHelpers<RegisterDoctorValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem("userToken");
      const userData: any = await AsyncStorage.getItem("userData");
      console.log({ token, userData });
      if (!token || !userData) {
        setErrorMessage("No token or user data found, please log in again.");
        // setLoading(false);
        // return;
      }

      const user = JSON.parse(userData);

      const requestBody = {
        ...values,
        user: {
          userId: user.id,
        },
        // userId: "c4a6fac0-d7c2-477a-b193-42d3a9b4b15e",
      };

      const res = await fetch("http://192.168.1.199:5000/api/doctor/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify(requestBody),
      });

      console.log(res);
      const data = await res.json();
      console.log(data);

      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      if (res.ok) {
        router.push("(tabs)");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={doctorRegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView>
            <AuthInputField
              name="specialization"
              label="Specialization"
              placeholder="Enter your specialization"
            />
            <AuthInputField
              name="documents"
              label="Documents"
              placeholder="Enter your documents"
            />
            <AuthInputField
              name="experience"
              label="Experience"
              placeholder="Enter your experience"
              keyboardType="numeric"
            />
            <AuthInputField
              name="fee"
              label="Fee"
              placeholder="Enter your fee"
              keyboardType="numeric"
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
            />
            {/* <MultiSelect
              options={options}
              selectedValues={selectedValues}
              onSelect={handleSelect}
              containerStyle={styles.multiSelect}
            /> */}
            <AppButton
              containerStyle={{ marginTop: 24 }}
              title="Submit"
              onPress={handleSubmit as () => void}
              width={"100%"}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Registering...."
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
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
    marginVertical: 12,
    zIndex: 99,
  },
});

export default DoctorRegistrationScreen;
