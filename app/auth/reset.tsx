import {
  AppButton,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, StyleSheet, Text } from "react-native";
import * as yup from "yup";

interface ResetValues {
  password: string;
  confirmPassword: string;
  code: string;
  email: string;
}

const reset = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {t} = useTranslation()

  const initialValues: ResetValues = {
    password: "",
    confirmPassword: "",
    code: "",
    email: "",
  };

  const resetSchema = yup.object({
    password: yup
      .string()
      .trim(t("reset.yup.password.trim"))
      .min(8, t("reset.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("reset.yup.password.matches")
      )
      .required(t("reset.yup.password.required")),
    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("reset.yup.confirmPassword.oneOf")
      )
      .required(t("reset.yup.confirmPassword.required")),
    code: yup
      .string()
      .matches(/^[A-Z0-9]{6}$/, t("reset.yup.code.matches"))
      .required(t("reset.yup.code.required")),
    email: yup
      .string()
      .trim(t("reset.yup.email.trim"))
      .email(t("reset.yup.email.email"))
      .required(t("reset.yup.email.required")),
  });

  const handleSubmit = async (
    values: ResetValues,
    actions: FormikHelpers<ResetValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Retrieve the code from AsyncStorage
      const storedCode = await AsyncStorage.getItem("resetCode");
      console.log(storedCode);

      if (storedCode !== values.code) {
        setErrorMessage("The code you entered is incorrect.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "http:192.168.1.199:5001/api/user/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (data.success === false) return setErrorMessage(data.message);
      setLoading(false);
      if (res.ok) router.push("auth/login");
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="larger">{t("reset.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="code"
              placeholder={t("reset.form.placeholder1")}
              label={t("reset.form.label1")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="email"
              placeholder={t("reset.form.placeholder2")}
              label={t("reset.form.label2")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="password"
              placeholder={t("reset.form.placeholder3")}
              label={t("reset.form.label3")}
              containerStyle={{ marginBottom: 16 }}
              secureTextEntry={!secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <AuthInputField
              name="confirmPassword"
              placeholder={t("reset.form.placeholder4")}
              label={t("reset.form.label4")}
              containerStyle={{ marginBottom: 16 }}
              secureTextEntry={!secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("reset.button")}
              loading={loading}
              loadingText={t("reset.loading")}
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
      {errorMessage ? (
        <Text style={{ color: "red", marginTop: 10 }}>{errorMessage}</Text>
      ) : null}
    </KeyboardAvoidingView>
  );
};

export default reset;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
