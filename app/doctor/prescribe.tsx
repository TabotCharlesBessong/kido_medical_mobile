import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Button,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { AppButton, AuthInputField, CustomText } from "@/components";
import * as yup from "yup";
import { Formik, FieldArray, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";
import { Frequency } from "@/constants/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    instructions: yup
      .string()
      .required(t("createPrescription.validation.instructionsRequired")),
    investigation: yup
      .string()
      .required(t("createPrescription.validation.investigationRequired")),
    medications: yup
      .array()
      .of(
        yup.object().shape({
          name: yup
            .string()
            .required(
              t("createPrescription.validation.medicationNameRequired")
            ),
          dosage: yup
            .string()
            .required(t("createPrescription.validation.dosageRequired")),
          frequency: yup
            .string()
            .oneOf(["ONCE_A_DAY", "TWICE_A_DAY", "THRICE_A_DAY"])
            .required(t("createPrescription.validation.frequencyRequired")),
          duration: yup
            .string()
            .required(t("createPrescription.validation.durationRequired")),
        })
      )
      .required(t("createPrescription.validation.atLeastOneMedicationRequired"))
      .min(1, t("createPrescription.validation.atLeastOneMedicationRequired")),
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
    <ScrollView style={styles.container}>
      <CustomText type="h1">{t("createPrescription.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={prescriptionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values }) => (
          <KeyboardAvoidingView behavior="height">
            <AuthInputField
              name="instructions"
              label={t("createPrescription.fields.instructions")}
              placeholder={t("createPrescription.placeholders.instructions")}
            />
            <AuthInputField
              name="investigation"
              label={t("createPrescription.fields.investigation")}
              placeholder={t("createPrescription.placeholders.investigation")}
            />
            <FieldArray name="medications">
              {({ push, remove }) => (
                <View>
                  {values.medications.map((_, index) => (
                    <View key={index} style={styles.medicationContainer}>
                      <AuthInputField
                        name={`medications[${index}].name`}
                        label={t("createPrescription.fields.medicationName")}
                        placeholder={t(
                          "createPrescription.placeholders.medicationName"
                        )}
                      />
                      <AuthInputField
                        name={`medications[${index}].dosage`}
                        label={t("createPrescription.fields.dosage")}
                        placeholder={t(
                          "createPrescription.placeholders.dosage"
                        )}
                      />
                      <AuthInputField
                        name={`medications[${index}].frequency`}
                        label={t("createPrescription.fields.frequency")}
                        placeholder={t(
                          "createPrescription.placeholders.frequency"
                        )}
                      />
                      <AuthInputField
                        name={`medications[${index}].duration`}
                        label={t("createPrescription.fields.duration")}
                        placeholder={t(
                          "createPrescription.placeholders.duration"
                        )}
                      />
                      <AppButton
                        title={t("createPrescription.buttons.removeMedication")}
                        onPress={() => remove(index)}
                        containerStyle={{
                          backgroundColor: COLORS.danger,
                          marginTop: 16,
                          width: "100%",
                        }}
                      />
                    </View>
                  ))}
                  <AppButton
                    title={t("createPrescription.buttons.addMedication")}
                    onPress={() =>
                      push({
                        name: "",
                        dosage: "",
                        frequency: "ONCE_A_DAY",
                        duration: "",
                      })
                    }
                    containerStyle={{
                      backgroundColor: COLORS.primary,
                      marginVertical: 16,
                      width: "100%",
                    }}
                  />
                </View>
              )}
            </FieldArray>
            <AppButton
              title={t("createPrescription.buttons.submit")}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText={t("createPrescription.buttons.submitting")}
              onPress={handleSubmit}
              width={"100%"}
              containerStyle={{marginBottom:32}}
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
    paddingBottom:24
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
