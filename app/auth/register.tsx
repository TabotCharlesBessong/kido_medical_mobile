import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks

import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { registerUser, clearAuthError } from "@/redux/slice/authSlice"; // Import register thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface SignupValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [secureTextEntry, setSecureTextEntry] = useState(true); // Default to true

  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Clear authentication error when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const initialValues: SignupValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object({
    firstname: yup.string().required(t("register.yup.firstname.required")),
    lastname: yup.string().required(t("register.yup.lastname.required")),
    email: yup
      .string()
      .email(t("register.yup.email.invalid"))
      .required(t("register.yup.email.required")),
    password: yup
      .string()
      .required(t("register.yup.password.required"))
      .min(8, t("register.yup.password.min"))
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        t("register.yup.password.matches")
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("register.yup.confirmPassword.match"))
      .required(t("register.yup.confirmPassword.required")),
  });

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    // Destructure to exclude confirmPassword from being sent to the backend
    const { confirmPassword, ...dataToSend } = values;
    const resultAction = await dispatch(registerUser(dataToSend));

    // Check if the thunk was fulfilled (successful)
    if (registerUser.fulfilled.match(resultAction)) {
      // Navigate to verification screen on success
      router.push("/auth/verify");
    }
    // Error handling is managed by the Redux state and displayed in the UI
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("register.title")}</CustomText>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="firstname"
              label={t("register.form.label1")}
              placeholder={t("register.form.placeholder1")}
              containerStyle={styles.inputField}
              autoCapitalize="words" // Capitalize first letter of words
            />
            <AuthInputField
              name="lastname"
              label={t("register.form.label2")}
              placeholder={t("register.form.placeholder2")}
              containerStyle={styles.inputField}
              autoCapitalize="words"
            />
            <AuthInputField
              name="email"
              label={t("register.form.label3")}
              placeholder={t("register.form.placeholder3")}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="password"
              label={t("register.form.label4")}
              placeholder={t("register.form.placeholder4")}
              secureTextEntry={secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => setSecureTextEntry(!secureTextEntry)}
              containerStyle={styles.inputField}
            />
            <AuthInputField
              name="confirmPassword"
              label={t("register.form.label5")}
              placeholder={t("register.form.placeholder5")}
              secureTextEntry={secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => setSecureTextEntry(!secureTextEntry)}
              containerStyle={styles.inputField}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AppButton
              title={t("register.button")}
              onPress={handleSubmit}
              backgroundColor={COLORS.primary}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("register.loading")}
              containerStyle={styles.appButton}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("register.loginText")}</CustomText>
              <AppLink
                title={t("register.loginLink")}
                onPress={() => router.push("/auth/login")}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 16,
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
  appButton: {
    width: "100%",
    marginTop: 10, // Added margin top for spacing
  },
  bottomLinks: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 8,
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
