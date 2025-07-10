// app/auth/verify.tsx
import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Text } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { AppButton, AuthInputField, CustomText } from "@/components";
import { baseUrl } from "@/utils/constants";
import { useRouter } from "expo-router";

interface VerifyValues {
  email: string;
  token: string;
}

const VerifyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialValues: VerifyValues = {
    email: "",
    token: "",
  };

  const schema = yup.object({
    email: yup.string().email().required(),
    token: yup.string().required("Verification token is required"),
  });

  const handleSubmit = async (
    values: VerifyValues,
    actions: FormikHelpers<VerifyValues>
  ) => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/user/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setLoading(false);
      router.push("/auth/login");
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="h1">Verify Account</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View>
            <AuthInputField
              name="email"
              label="Email"
              placeholder="Enter your email"
            />
            <AuthInputField
              name="token"
              label="Token"
              placeholder="Enter verification token"
            />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            <AppButton
              title="Verify"
              onPress={handleSubmit}
              backgroundColor="#0C6CF2"
              loading={loading}
              containerStyle={{ marginTop: 16 }}
            />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
});
