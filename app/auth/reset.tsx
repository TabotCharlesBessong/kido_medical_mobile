import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store"; // Import SecureStore for the reset code

import {
  AppButton,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { resetPassword, clearAuthError } from "@/redux/slice/authSlice"; // Import the thunk
import { AppDispatch, RootState } from "@/redux/store"; // Import types

interface ResetValues {
  password: string;
  confirmPassword: string;
  code: string;
  email: string;
}

const ResetPasswordScreen = () => {
  // Renamed for clarity
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true); // Default to true
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use Redux state
  const [localErrorMessage, setLocalErrorMessage] = useState(""); // For client-side validation errors not from Redux (e.g., code mismatch)

  useEffect(() => {
    dispatch(clearAuthError()); // Clear any previous Redux errors
    setLocalErrorMessage(""); // Clear local errors
    // Optionally pre-fill email if it was passed from the forgot screen,
    // or auto-fill code if saved for dev purposes.
  }, [dispatch]);

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
      .oneOf([yup.ref("password")], t("reset.yup.confirmPassword.oneOf"))
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
    setLocalErrorMessage(""); // Clear previous local error before new submission

    // Retrieve the code from SecureStore (if saved for dev/testing)
    const storedCode = await SecureStore.getItemAsync("resetCode");

    if (storedCode && storedCode !== values.code) {
      setLocalErrorMessage(t("reset.error.incorrectCode")); // Use translation key
      return;
    }

    const resultAction = await dispatch(resetPassword(values));

    if (resetPassword.fulfilled.match(resultAction)) {
      // Password reset successfully, navigate to login
      // Optionally show a success message
      router.push("/auth/login");
    }
    // Errors are handled by Redux state or localErrorMessage and displayed in the UI.
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">
        {" "}
        {/* Changed to h1, adjusted style */}
        {t("reset.title")}
      </CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="code"
              placeholder={t("reset.form.placeholder1")}
              label={t("reset.form.label1")}
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="email"
              placeholder={t("reset.form.placeholder2")}
              label={t("reset.form.label2")}
              containerStyle={styles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInputField
              name="password"
              placeholder={t("reset.form.placeholder3")}
              label={t("reset.form.label3")}
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry}
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
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry} // Use the same secureTextEntry state
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            {error || localErrorMessage ? (
              <Text style={styles.errorText}>{error || localErrorMessage}</Text>
            ) : null}
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("reset.button")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("reset.loading")}
              containerStyle={styles.appButton}
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  appButton: {
    width: "100%",
    marginTop: 10,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 10,
    alignSelf: "center",
    textAlign: "center",
    width: "100%",
  },
});
