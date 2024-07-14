import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

interface ForgotValues {
  email: string;
}

const forgot = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const initialValues: ForgotValues = {
    email: "",
  };
  const {t} = useTranslation()

  const signupSchema = yup.object({
    email: yup
      .string()
      .trim(t("login.yup.email.trim"))
      .email(t("login.yup.email.email"))
      .required(t("login.yup.email.required")),
  });

  const handleSubmit = async (
    values: ForgotValues,
    actions: FormikHelpers<ForgotValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch(
        "http:192.168.1.185:5000/api/user/forgot-password",
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

      // storring the code
      await AsyncStorage.setItem("resetCode",data.data.token.code)
      const rcode = data.data.token.code
      console.log(rcode)
      setLoading(false);
      if (res.ok) router.push("auth/reset");
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="h2">
        You forgot your password, no problem you can reset it
      </CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              label={t("forgotPassword.emailLabel")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("forgotPassword.submitButton")}
              loading={loading}
              loadingText={t("forgotPassword.loadingText")}
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default forgot;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
