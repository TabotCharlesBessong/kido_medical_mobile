Certainly! To pass the parameters (`patientId` and `appointmentId`) from the previous screen to the `ConsultationScreen` using `expo-router`, you can update the previous screen's navigation logic. Let's assume that the previous screen is `AppointmentDetailsScreen`. Here's how you can update it:

### AppointmentDetailsScreen.tsx
```typescript
import React from "react";
import { View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";

const AppointmentDetailsScreen: React.FC = ({ route }) => {
  const router = useRouter();
  const { patientId, appointmentId } = route.params;

  const handleConsultation = () => {
    router.push({
      pathname: "/ConsultationScreen",
      params: { patientId, appointmentId },
    });
  };

  return (
    <View style={styles.container}>
      <CustomText type="larger">Appointment Details</CustomText>
      <AppButton
        title="Start Consultation"
        backgroundColor={COLORS.primary}
        onPress={handleConsultation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppointmentDetailsScreen;
```

In this example, the `AppointmentDetailsScreen` has a button that, when pressed, navigates to the `ConsultationScreen` with the `patientId` and `appointmentId` passed as parameters.

### ConsultationScreen.tsx
Here's the updated `ConsultationScreen` that retrieves and uses these parameters:

```typescript
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { AppButton, AuthInputField, CustomText } from "@/components";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";

interface ConsultationValues {
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
}

const ConsultationScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { patientId, appointmentId } = useSearchParams();

  const initialValues: ConsultationValues = {
    presentingComplaints: "",
    pastHistory: "",
    diagnosticImpression: "",
    investigations: "",
    treatment: "",
  };

  const consultationSchema = yup.object().shape({
    presentingComplaints: yup.string().required("Presenting Complaints are required"),
    pastHistory: yup.string().required("Past History is required"),
    diagnosticImpression: yup.string().required("Diagnostic Impression is required"),
    investigations: yup.string().required("Investigations are required"),
    treatment: yup.string().required("Treatment is required"),
  });

  const handleSubmit = async (
    values: ConsultationValues,
    actions: FormikHelpers<ConsultationValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);

      // Create an instance of axios with default headers
      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Add request interceptor to handle authorization
      instance.interceptors.request.use(
        async (config) => {
          // Refresh the bearer token if expired or not available
          const newToken = await AsyncStorage.getItem("userToken");
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor to handle errors
      instance.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.response) {
            // Handle HTTP errors
            console.log(error.response.data);
            setErrorMessage(error.response.data.message);
          } else {
            // Handle network errors
            console.log(error.message);
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      // Make the API request
      const res = await instance.post("/consultation/create", {
        ...values,
        patientId,
        appointmentId,
      });
      console.log(res);
      const data = res.data;
      console.log(data);

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <CustomText type="larger">Consultation</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={consultationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="presentingComplaints"
              label="Presenting Complaints"
              placeholder="Enter presenting complaints"
            />
            <AuthInputField
              name="pastHistory"
              label="Past History"
              placeholder="Enter past history"
            />
            <AuthInputField
              name="diagnosticImpression"
              label="Diagnostic Impression"
              placeholder="Enter diagnostic impression"
            />
            <AuthInputField
              name="investigations"
              label="Investigations"
              placeholder="Enter investigations"
            />
            <AuthInputField
              name="treatment"
              label="Treatment"
              placeholder="Enter treatment"
            />
            <AppButton
              title="Submit"
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Submitting..."
              onPress={handleSubmit}
            />
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default ConsultationScreen;
```

### Explanation:
1. **Passing Parameters**: In the `AppointmentDetailsScreen`, the `handleConsultation` function navigates to `ConsultationScreen` while passing `patientId` and `appointmentId` as params using the `router.push` method.
2. **Receiving Parameters**: In the `ConsultationScreen`, the `useSearchParams` hook from `expo-router` is used to retrieve `patientId` and `appointmentId` from the route parameters.
3. **Form Handling**: The rest of the `ConsultationScreen` implementation remains similar to the `CompleteScreen`, with form fields for `presentingComplaints`, `pastHistory`, `diagnosticImpression`, `investigations`, and `treatment`, and form submission logic to send these details along with the received `patientId` and `appointmentId` to the backend API.

This setup should allow you to pass the necessary parameters and handle the consultation form submission effectively.