// app/auth/register.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/constants";

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
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initialValues: SignupValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object({
    firstname: yup.string().required("First name is required"),
    lastname: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Minimum 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Weak password"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Confirm your password"),
  });

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setLoading(false);
      // @ts-ignore
      router.push("/auth/verify");
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="h1">{t("register.title")}</CustomText>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView>
            <AuthInputField name="firstname" label="First Name" placeholder="John" />
            <AuthInputField name="lastname" label="Last Name" placeholder="Doe" />
            <AuthInputField name="email" label="Email" placeholder="example@mail.com" />
            <AuthInputField
              name="password"
              label="Password"
              placeholder="Enter password"
              secureTextEntry={secure}
              rightIcon={<PasswordVisibilityIcon privateIcon={secure} />}
              onRightIconPress={() => setSecure(!secure)}
            />
            <AuthInputField
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat password"
              secureTextEntry={secure}
              rightIcon={<PasswordVisibilityIcon privateIcon={secure} />}
              onRightIconPress={() => setSecure(!secure)}
            />
            {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
            <AppButton
              title="Register"
              onPress={handleSubmit}
              backgroundColor={COLORS.primary}
              loading={loading}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">Already have an account?</CustomText>
              <AppLink title="Login" onPress={() => router.push("/auth/login")} />
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  bottomLinks: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 8,
  },
});
