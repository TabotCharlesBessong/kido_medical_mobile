import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Button,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppButton, AuthInputField, CustomText } from "@/components";
import * as yup from "yup";
import { Formik, FieldArray, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";
import { Frequency } from "@/constants/types";

interface Medication {
  name: string;
  dosage: string;
  frequency: "ONCE_A_DAY" | "TWICE_A_DAY" | "THRICE_A_DAY";
  duration: string;
}

interface PrescriptionValues {
  instructions: string;
  investigation: string;
  medications: Medication[];
}

const CreatePrescriptionScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { consultationId } = useLocalSearchParams();

  const initialValues: PrescriptionValues = {
    instructions: "",
    investigation: "",
    medications: [
      { name: "", dosage: "", frequency: Frequency.ONCE_A_DAY, duration: "" },
    ],
  };

  const prescriptionSchema = yup.object().shape({
    instructions: yup.string().required("Instructions are required"),
    investigation: yup.string().required("Investigation is required"),
    medications: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("Medication name is required"),
          dosage: yup.string().required("Dosage is required"),
          frequency: yup
            .string()
            .oneOf(["ONCE_A_DAY", "TWICE_A_DAY", "THRICE_A_DAY"])
            .required("Frequency is required"),
          duration: yup.string().required("Duration is required"),
        })
      )
      .required("At least one medication is required")
      .min(1, "At least one medication is required"),
  });

  const handleSubmit = async (
    values: PrescriptionValues,
    actions: FormikHelpers<PrescriptionValues>
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
      const res = await instance.post("/prescription/create", {
        ...values,
        consultationId,
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
      <CustomText type="larger">Create Prescription</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={prescriptionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values }) => (
          <ScrollView>
            <AuthInputField
              name="instructions"
              label="Instructions"
              placeholder="Enter instructions"
            />
            <AuthInputField
              name="investigation"
              label="Investigation"
              placeholder="Enter investigation"
            />
            <FieldArray name="medications">
              {({ push, remove }) => (
                <View>
                  {values.medications.map((_, index) => (
                    <View key={index} style={styles.medicationContainer}>
                      <AuthInputField
                        name={`medications[${index}].name`}
                        label="Medication Name"
                        placeholder="Enter medication name"
                      />
                      <AuthInputField
                        name={`medications[${index}].dosage`}
                        label="Dosage"
                        placeholder="Enter dosage"
                      />
                      <AuthInputField
                        name={`medications[${index}].frequency`}
                        label="Frequency"
                        placeholder="Enter frequency"
                      />
                      <AuthInputField
                        name={`medications[${index}].duration`}
                        label="Duration"
                        placeholder="Enter duration"
                      />
                      <Button
                        title="Remove Medication"
                        onPress={() => remove(index)}
                      />
                    </View>
                  ))}
                  <Button
                    title="Add Medication"
                    onPress={() =>
                      push({
                        name: "",
                        dosage: "",
                        frequency: "ONCE_A_DAY",
                        duration: "",
                      })
                    }
                  />
                </View>
              )}
            </FieldArray>
            <AppButton
              title="Submit"
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Submitting..."
              onPress={handleSubmit}
            />
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </ScrollView>
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
  medicationContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default CreatePrescriptionScreen;
