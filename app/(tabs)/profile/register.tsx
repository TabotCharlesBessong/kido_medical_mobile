import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { RegisterDoctorValues } from "@/constants/types";
import {
  AppButton,
  AuthInputField,
  AuthSelectField,
  CustomText,
} from "@/components";
import { COLORS } from "@/constants/theme";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "@/utils/variables";
import { useTranslation } from "react-i18next";
import { Toast } from "react-native-toast-notifications";

const DoctorRegistrationScreen: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const initialValues: RegisterDoctorValues = {
    // name: "",
    specialization: "",
    // location: "",
    experience: 0,
    language: "",
    fee: 0,
    documents: "",
  };

  const doctorRegistrationSchema = yup.object({
    // name: yup.string().required(t("doctorRegistration.yup.req1")),
    specialization: yup.string().required(t("doctorRegistration.yup.req2")),
    // location: yup.string().required(t("doctorRegistration.yup.req3")),
    documents: yup.string().required(t("doctorRegistration.yup.req4")),
    experience: yup
      .number()
      .required(t("doctorRegistration.yup.req5"))
      .min(0, t("doctorRegistration.yup.pos1")),
    language: yup.string().required(t("doctorRegistration.yup.req6")),
    fee: yup
      .number()
      .required(t("doctorRegistration.yup.req7"))
      .min(0, t("doctorRegistration.yup.pos2")),
  });

  const registerDoctor = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Navigate to the tabs screen
      router.push("(tabs)");
    }, 2000);
    // Show a success toast
    Toast.show("Registration successful!", {
      type: "success",
      placement: "top",
      duration: 3000, // Duration of the toast message
    });
  };

  

  const handleSubmit = async (
    values: RegisterDoctorValues,
    actions: FormikHelpers<RegisterDoctorValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);

      // Make the API request using fetch
      const res = await fetch(`${baseUrl}/doctor/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      console.log(data);

      // Handle success and redirect
      if (res.ok) {
        setSuccessMessage(t("complete.successMessage"));
        setLoading(false);
        router.push("(tabs)");
      } else {
        setLoading(false);
        setErrorMessage(data.message || t("complete.defaultError"));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(t("complete.networkError"));
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText type="h1">{t("doctorRegistration.text1")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={doctorRegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView>
            {/* <AuthInputField
              name="name"
              label={t("doctorRegistration.form.label1")}
              placeholder={t("doctorRegistration.form.placeholder1")}
            /> */}
            <AuthInputField
              name="specialization"
              label={t("doctorRegistration.form.label2")}
              placeholder={t("doctorRegistration.form.placeholder2")}
            />
            {/* <AuthInputField
              name="location"
              label={t("doctorRegistration.form.label3")}
              placeholder={t("doctorRegistration.form.placeholder3")}
            /> */}
            <AuthInputField
              name="experience"
              label={t("doctorRegistration.form.label4")}
              placeholder={t("doctorRegistration.form.placeholder4")}
              keyboardType="numeric"
            />
            <AuthSelectField
              name="language"
              label={t("doctorRegistration.form.label5")}
              placeholder={t("doctorRegistration.form.placeholder5")}
              options={[
                { label: "English", value: "English" },
                { label: "French", value: "French" },
                { label: "Spanish", value: "Spanish" },
                { label: "German", value: "German" },
              ]}
            />
            <AuthInputField
              name="fee"
              label={t("doctorRegistration.form.label6")}
              placeholder={t("doctorRegistration.form.placeholder6")}
              keyboardType="numeric"
            />
            <AuthInputField
              name="documents"
              label={t("doctorRegistration.form.label7")}
              placeholder={t("doctorRegistration.form.placeholder7")}
            />
            <AppButton
              containerStyle={{ marginTop: 24 }}
              title={t("doctorRegistration.button")}
              onPress={registerDoctor}
              width={"100%"}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText={t("doctorRegistration.loader")}
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
    // flex: 1,
    padding: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default DoctorRegistrationScreen;
