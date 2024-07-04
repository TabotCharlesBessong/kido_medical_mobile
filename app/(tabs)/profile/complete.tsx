import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { IPatient } from "@/constants/types";
import { AppButton, AuthInputField, CustomText } from "@/components";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";

interface CompleteValues {
  gender: string;
  age: number;
  address1: string;
  address2: string;
  occupation: string;
  phone: number;
}

const CompleteScreen: React.FC = () => {
  const [patientData, setPatientData] = useState<IPatient>({
    id: "",
    userId: "",
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phone: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const initialValues: CompleteValues = {
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phone: 0,
  };

  const completionSchema = yup.object().shape({
    gender: yup
      .string()
      .oneOf(["MALE", "FEMALE"])
      .required("Gender is required"),
    age: yup
      .number()
      .positive("Age must be a positive number")
      .required("Age is required"),
    address1: yup.string().required("Address 1 is required"),
    address2: yup.string(),
    occupation: yup.string().required("Occupation is required"),
    phone: yup
      .string()
      .matches(/^(?:\d{9}|\d{14})$/, "Phone number must be 9 or 14 digits long")
      .required("Phone number is required"),
  });

  const handleInputChange = (name: keyof IPatient, value: string | number) => {
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    values: CompleteValues,
    actions: FormikHelpers<CompleteValues>
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
      const res = await instance.post("/patient/create", values);
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
      <CustomText type="larger">Create account</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={completionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="gender"
              label="Gender"
              placeholder="Enter your gender"
              // onChangeText={(value:string) => handleInputChange("gender", value)}
            />
            <AuthInputField
              name="age"
              label="Age"
              placeholder="Enter your age"
              keyboardType="numeric"
              // onChangeText={(value) => handleInputChange("age", Number(value))}
            />
            <AuthInputField
              name="address1"
              label="City"
              placeholder="Enter your city"
              // onChangeText={(value) => handleInputChange("address1", value)}
            />
            <AuthInputField
              name="address2"
              label="Quarter"
              placeholder="Enter your quarter"
              // onChangeText={(value) => handleInputChange("address2", value)}
            />
            <AuthInputField
              name="occupation"
              label="Occupation"
              placeholder="Enter your occupation"
              // onChangeText={(value) => handleInputChange("occupation", value)}
            />
            <AuthInputField
              name="phone"
              label="Phone"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              // onChangeText={(value) => handleInputChange("phone", Number(value))}
            />
            <AppButton
              title="Submit"
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Completing..."
              onPress={handleSubmit}
            />
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
});

export default CompleteScreen;
