import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton, AuthInputField, CustomText } from "@/components";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";
import { useTranslation } from "react-i18next";

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
  const { patientId, appointmentId } = useLocalSearchParams();
  const { t } = useTranslation();

  const initialValues: ConsultationValues = {
    presentingComplaints: "",
    pastHistory: "",
    diagnosticImpression: "",
    investigations: "",
    treatment: "",
  };

  const consultationSchema = yup.object().shape({
    presentingComplaints: yup
      .string()
      .required(t("consultation.validation.presentingComplaintsRequired")),
    pastHistory: yup
      .string()
      .required(t("consultation.validation.pastHistoryRequired")),
    diagnosticImpression: yup
      .string()
      .required(t("consultation.validation.diagnosticImpressionRequired")),
    investigations: yup
      .string()
      .required(t("consultation.validation.investigationsRequired")),
    treatment: yup
      .string()
      .required(t("consultation.validation.treatmentRequired")),
  });

  const handleSubmit = async (
    values: ConsultationValues,
    actions: FormikHelpers<ConsultationValues>
  ) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await AsyncStorage.getItem("userToken");

      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      instance.interceptors.request.use(async (config) => {
        const newToken = await AsyncStorage.getItem("userToken");
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        return config;
      });

      instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      const res = await instance.post("/consultation/create", {
        ...values,
        patientId,
        appointmentId,
      });

      const data = res.data;

      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <CustomText type="larger">{t("consultation.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={consultationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="presentingComplaints"
              label={t("consultation.presentingComplaintsLabel")}
              placeholder={t("consultation.presentingComplaintsPlaceholder")}
            />
            <AuthInputField
              name="pastHistory"
              label={t("consultation.pastHistoryLabel")}
              placeholder={t("consultation.pastHistoryPlaceholder")}
            />
            <AuthInputField
              name="diagnosticImpression"
              label={t("consultation.diagnosticImpressionLabel")}
              placeholder={t("consultation.diagnosticImpressionPlaceholder")}
            />
            <AuthInputField
              name="investigations"
              label={t("consultation.investigationsLabel")}
              placeholder={t("consultation.investigationsPlaceholder")}
            />
            <AuthInputField
              name="treatment"
              label={t("consultation.treatmentLabel")}
              placeholder={t("consultation.treatmentPlaceholder")}
            />
            <AppButton
              title={t("consultation.submitButton")}
              containerStyle={{ backgroundColor: "green", marginTop: 24 }}
              loading={loading}
              loadingText={t("consultation.submittingText")}
              onPress={handleSubmit}
              width={"100%"}
            />
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
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
