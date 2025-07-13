import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Text } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { useTranslation } from "react-i18next"; // Ensure you're importing useTranslation

import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme"; // Import COLORS for consistent styling
import { verifyAccount, clearAuthError } from "@/redux/slice/authSlice"; // Import verify thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface VerifyValues {
  email: string;
  code: string; // Renamed from 'token' to 'code' as per Postman and type definition
}

const VerifyScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Clear authentication error when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: VerifyValues = {
    email: "",
    code: "",
  };

  const schema = yup.object({
    email: yup
      .string()
      .email(t("verify.yup.email.invalid"))
      .required(t("verify.yup.email.required")),
    code: yup.string().required(t("verify.yup.code.required")),
  });

  const handleSubmit = async (
    values: VerifyValues,
    actions: FormikHelpers<VerifyValues>
  ) => {
    const resultAction = await dispatch(verifyAccount(values));

    if (verifyAccount.fulfilled.match(resultAction)) {
      // Account verified successfully, navigate to login
      // Optionally show a success message here (e.g., using a toast library)
      router.push("/auth/login");
    }
    // Error handling is managed by the Redux state and displayed in the UI
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("verify.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              label={t("verify.form.label1")}
              placeholder={t("verify.form.placeholder1")}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="code" // Corrected name
              label={t("verify.form.label2")} // Corrected name
              placeholder={t("verify.form.placeholder2")} // Corrected name
              containerStyle={styles.inputField}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AppButton
              title={t("verify.button")}
              onPress={handleSubmit}
              backgroundColor={COLORS.primary}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("verify.loading")}
              containerStyle={{ marginTop: 16, width: "100%" }} // Ensure button takes full width
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
    width: "100%",
  },
  formContainer: {
    width: "100%", // Ensures Formik content takes full width
    alignItems: "center", // Center items within the form
  },
  inputField: {
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 10,
    alignSelf: "center",
    textAlign: "center",
    width: "100%",
  },
});
