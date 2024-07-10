// DoctorRegistrationScreen.tsx
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { RegisterDoctorValues } from "@/constants/types";
import { AppButton, AuthInputField, AuthSelectField } from "@/components";
import { COLORS } from "@/constants/theme";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "@/utils/variables";

const DoctorRegistrationScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

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
    documents: yup.string().required("Documents are required"),
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

  const handleSubmit = async (
    values: RegisterDoctorValues,
    actions: FormikHelpers<RegisterDoctorValues>
  ) => {
    console.log("Submitting values:", values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log("Bearer token:", token);

      // Create an instance of axios with default headers
      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Add request interceptor to handle authorization
      instance.interceptors.request.use(
        async (config) => {
          // Refresh the bearer token if expired or not available
          const newToken = await AsyncStorage.getItem("userToken");
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor to handle errors
      instance.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.response) {
            // Handle HTTP errors
            console.log("HTTP error response:", error.response.data);
            setErrorMessage(error.response.data.message);
          } else {
            // Handle network errors
            console.log("Network error:", error.message);
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      // Make the API request
      const res = await instance.post("/doctor/create", values);
      console.log("API response:", res);
      const data = res.data;
      console.log("API response data:", data);

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      console.log("Error:", error);
      setErrorMessage((error as TypeError).message);
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
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
            <AppButton
              containerStyle={{ marginTop: 24 }}
              title="Submit"
              onPress={handleSubmit}
              width={"100%"}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Registering...."
            />
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
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
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default DoctorRegistrationScreen;
