import React, { useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { forgotPassword, clearAuthError } from "@/redux/slice/authSlice"; // Import the thunk
import { AppDispatch, RootState } from "@/redux/store"; // Import types

interface ForgotValues {
  email: string;
}

const ForgotPasswordScreen = () => {
  // Renamed for clarity
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use Redux state

  useEffect(() => {
    // Clear any previous authentication errors when component mounts
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: ForgotValues = {
    email: "",
  };

  const validationSchema = yup.object({
    // Renamed from signupSchema for clarity
    email: yup
      .string()
      .trim(t("forgotPassword.yup.email.trim"))
      .email(t("forgotPassword.yup.email.email"))
      .required(t("forgotPassword.yup.email.required")),
  });

  const handleSubmit = async (
    values: ForgotValues,
    actions: FormikHelpers<ForgotValues>
  ) => {
    const resultAction = await dispatch(forgotPassword(values));

    if (forgotPassword.fulfilled.match(resultAction)) {
      // On success, navigate to the reset password screen
      // Optionally show a success message (e.g., "Reset code sent to your email")
      router.push("/auth/reset");
    }
    // Errors are handled by Redux state and displayed in the UI.
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h2" >
        {t("forgotPassword.title")}
      </CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              label={t("forgotPassword.emailLabel")}
              containerStyle={styles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}{" "}
            {/* Display Redux error */}
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("forgotPassword.submitButton")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("forgotPassword.loadingText")}
              containerStyle={styles.appButton}
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

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
    marginBottom: 10,
    alignSelf: "center",
    textAlign: "center",
    width: "100%",
  },
});
