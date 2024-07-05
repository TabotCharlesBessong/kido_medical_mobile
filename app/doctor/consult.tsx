import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton, AuthInputField, CustomText } from "@/components";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";

interface ConsultationValues {
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
}

const ConsultationScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  console.log(useLocalSearchParams)
  const { patientId, appointmentId } = useLocalSearchParams();
  console.log({appointmentId,patientId})

  const initialValues: ConsultationValues = {
    presentingComplaints: "",
    pastHistory: "",
    diagnosticImpression: "",
    investigations: "",
    treatment: "",
  };

  const consultationSchema = yup.object().shape({
    presentingComplaints: yup.string().required("Presenting Complaints are required"),
    pastHistory: yup.string().required("Past History is required"),
    diagnosticImpression: yup.string().required("Diagnostic Impression is required"),
    investigations: yup.string().required("Investigations are required"),
    treatment: yup.string().required("Treatment is required"),
  });

  const handleSubmit = async (
    values: ConsultationValues,
    actions: FormikHelpers<ConsultationValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);

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
            console.log(error.response.data);
            setErrorMessage(error.response.data.message);
          } else {
            // Handle network errors
            console.log(error.message);
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      // Make the API request
      const res = await instance.post("/consultation/create", {
        ...values,
        patientId,
        appointmentId,
      });
      console.log(res);
      const data = res.data;
      console.log(data);

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <CustomText type="larger">Consultation</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={consultationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="presentingComplaints"
              label="Presenting Complaints"
              placeholder="Enter presenting complaints"
            />
            <AuthInputField
              name="pastHistory"
              label="Past History"
              placeholder="Enter past history"
            />
            <AuthInputField
              name="diagnosticImpression"
              label="Diagnostic Impression"
              placeholder="Enter diagnostic impression"
            />
            <AuthInputField
              name="investigations"
              label="Investigations"
              placeholder="Enter investigations"
            />
            <AuthInputField
              name="treatment"
              label="Treatment"
              placeholder="Enter treatment"
            />
            <AppButton
              title="Submit"
              // backgroundColor={COLORS.primary}
              containerStyle={{backgroundColor:"green",marginTop:24}}
              loading={loading}
              loadingText="Submitting..."
              onPress={handleSubmit}
              width={"100%"}
            />
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
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

export default ConsultationScreen;
