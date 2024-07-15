import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { IPatient } from "@/constants/types";
import {
  AppButton,
  AuthInputField,
  AuthSelectField,
  CustomText,
} from "@/components";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import { baseUrl } from "@/utils/variables";

interface CompleteValues {
  gender: string;
  age: number;
  address1: string;
  address2: string;
  occupation: string;
  phoneNumber: number;
}

const CompleteScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const initialValues: CompleteValues = {
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phoneNumber: 0,
  };

  const completionSchema = yup.object().shape({
    gender: yup
      .string()
      .oneOf([t("complete.options.one"), t("complete.options.two")])
      .required(t("complete.yup.req1")),
    age: yup
      .number()
      .positive(t("complete.yup.pos"))
      .required(t("complete.yup.req2")),
    address1: yup.string().required(t("complete.yup.req3")),
    address2: yup.string(),
    occupation: yup.string().required(t("complete.yup.req4")),
    phoneNumber: yup
      .string()
      .matches(/^(?:\d{9}|\d{14})$/, t("complete.yup.match"))
      .required(t("complete.yup.req5")),
  });

  const handleSubmit = async (
    values: CompleteValues,
    actions: FormikHelpers<CompleteValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);

      // Make the API request using fetch
      const res = await fetch(`${baseUrl}/patient/create`, {
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
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.ok) {
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
      <CustomText type="larger">{t("complete.text1")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={completionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView behavior="height" style={styles.container}>
            <AuthSelectField
              name="gender"
              label={t("complete.form.label1")}
              options={[
                { label: t("complete.options.one"), value: "MALE" },
                { label: t("complete.options.two"), value: "FEMALE" },
              ]}
              placeholder={t("complete.form.placeholder1")}
            />
            <AuthInputField
              name="age"
              label={t("complete.form.label2")}
              placeholder={t("complete.form.placeholder2")}
              keyboardType="numeric"
            />
            <AuthInputField
              name="address1"
              label={t("complete.form.label3")}
              placeholder={t("complete.form.placeholder3")}
            />
            <AuthInputField
              name="address2"
              label={t("complete.form.label4")}
              placeholder={t("complete.form.placeholder4")}
            />
            <AuthInputField
              name="occupation"
              label={t("complete.form.label5")}
              placeholder={t("complete.form.placeholder5")}
            />
            <AuthInputField
              name="phoneNumber"
              label={t("complete.form.label6")}
              placeholder={t("complete.form.placeholder6")}
              keyboardType="phone-pad"
            />
            <AppButton
              title={t("complete.button")}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText={t("complete.loader")}
              onPress={handleSubmit}
            />
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
});

export default CompleteScreen;
