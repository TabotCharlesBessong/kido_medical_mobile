import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

interface SignupValues {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword: string;
}

const register = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const initialValues: SignupValues = {
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
  const { t } = useTranslation();

  const signupSchema = yup.object({
    firstname: yup
      .string()
      .trim(t("register.yup.firstname.trim"))
      .min(3, t("register.yup.firstname.min"))
      .required(t("register.yup.firstname.required")),
    lastname: yup
      .string()
      .trim(t("register.yup.lastname.trim"))
      .min(3, t("register.yup.lastname.min"))
      .required(t("register.yup.lastname.required")),
    email: yup
      .string()
      .trim(t("register.yup.email.trim"))
      .email(t("register.yup.email.email"))
      .required(t("register.yup.email.required")),
    password: yup
      .string()
      .trim(t("register.yup.password.trim"))
      .min(8, t("register.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("register.yup.password.matches")
      )
      .required(t("register.yup.password.required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("register.yup.confirmPassword.oneOf"))
      .required(t("register.yup.confirmPassword.required")),
  });

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("http://192.168.1.194:5000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
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
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <CustomText type="h1">{t("register.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView behavior="height" style={styles.container}>
            <AuthInputField
              name="firstname"
              placeholder={t("register.form.placeholder1")}
              label={t("register.form.label1")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="lastname"
              placeholder={t("register.form.placeholder2")}
              label={t("register.form.label2")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="email"
              placeholder={t("register.form.placeholder3")}
              label={t("register.form.label3")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="password"
              placeholder={t("register.form.placeholder4")}
              label={t("register.form.label4")}
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
              placeholder={t("register.form.placeholder5")}
              label={t("register.form.label5")}
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
              title={t("register.button")}
              loading={loading}
              loadingText={t("register.loading")}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("register.bottomText")}</CustomText>
              <AppLink
                title={t("register.link")}
                onPress={() => router.push("auth/login")}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default register;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
    width: "100%",
  },
  bottomLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    flexDirection: "row",
    width: "90%",
  },
});
