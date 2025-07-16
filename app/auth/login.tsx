import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks for state and dispatch

import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { loginUser, clearAuthError } from "@/redux/slice/authSlice"; // Import login thunk and error clearer
import { AppDispatch, RootState } from "@/redux/store"; // Import RootState and AppDispatch types

interface SigninValues {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true); // Default to true for secure password input
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch: AppDispatch = useDispatch(); // Get the dispatch function
  const { isLoading, error, token, user } = useSelector(
    (state: RootState) => state.auth
  ); // Get relevant state from Redux

  // Clear authentication error when component mounts or user interaction implies new attempt
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Effect to navigate after successful login (when token becomes available)
  useEffect(() => {
    if (token && user) {
      // Ensure both token and user data are present
      router.replace("/(tabs)"); // Use replace to prevent going back to login screen after successful login
    }
  }, [token, user, router]); // Re-run effect when token or user changes

  const initialValues: SigninValues = {
    email: "",
    password: "",
  };

  const loginSchema = yup.object({
    // Renamed from signupSchema for clarity
    email: yup
      .string()
      .trim(t("login.yup.email.trim"))
      .email(t("login.yup.email.email"))
      .required(t("login.yup.email.required")),
    password: yup
      .string()
      .trim(t("login.yup.password.trim"))
      .min(8, t("login.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("login.yup.password.matches")
      )
      .required(t("login.yup.password.required")),
  });

  const handleSubmit = async (
    values: SigninValues,
    actions: FormikHelpers<SigninValues>
  ) => {
    // Dispatch the loginUser async thunk
    dispatch(loginUser(values));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <CustomText type="h1">{t("login.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="email"
              placeholder={t("login.form.placeholder1")}
              label={t("login.form.label1")}
              containerStyle={styles.inputField}
              keyboardType="email-address" // Recommended for email inputs
              autoCapitalize="none" // Prevents auto-capitalization for email
            />
            <AuthInputField
              name="password"
              placeholder={t("login.form.placeholder2")}
              label={t("login.form.label2")}
              containerStyle={styles.inputField}
              secureTextEntry={secureTextEntry} // Controlled by local state
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}{" "}
            {/* Display Redux error */}
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("login.forgotText")}</CustomText>
              <AppLink
                title={t("login.forgotLink")}
                onPress={() => router.push({ pathname: "/auth/forgot" })}
              />
            </View>
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("login.button")}
              loading={isLoading} // Use Redux isLoading state
              loadingText={t("login.loading")}
              containerStyle={styles.appButton}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("login.registerText")}</CustomText>
              <AppLink
                title={t("login.registerLink")}
                onPress={() => router.push({ pathname: "/auth/register" })}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 16, // Added horizontal padding for overall container
  },
  formContainer: {
    width: "100%", // Ensures Formik content takes full width
    alignItems: "center", // Center items within the form
  },
  inputField: {
    marginBottom: 16,
    width: "100%", // Ensures input fields take full width of formContainer
  },
  bottomLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    width: "100%", // Ensure links take full width of formContainer
    paddingHorizontal: 5, // Add some padding for the links
  },
  appButton: {
    width: "100%", // Ensures button takes full width of formContainer
  },
  errorText: {
    color: COLORS.danger, // Use defined danger color
    marginBottom: 10,
    alignSelf: "center", // Center the error text if it's there
    textAlign: "center",
    width: "100%",
  },
});
