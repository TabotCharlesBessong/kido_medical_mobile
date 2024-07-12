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
import { AppButton, AuthInputField, AuthSelectField, CustomText } from "@/components";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";
import { useTranslation } from 'react-i18next';
// import LanguageSelector from "@/components/LanguageSelector";
// import AuthSelectField from "@/components/AuthSelectField";

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
  const { t } = useTranslation();

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
      .oneOf([t('complete.options.one'), t('complete.options.two')])
      .required(t('complete.yup.req1')),
    age: yup
      .number()
      .positive(t('complete.yup.pos'))
      .required(t('complete.yup.req2')),
    address1: yup.string().required(t('complete.yup.req3')),
    address2: yup.string(),
    occupation: yup.string().required(t('complete.yup.re4')),
    phone: yup
      .string()
      .matches(/^(?:\d{9}|\d{14})$/, t('complete.yup.match'))
      .required(t('complete.yup.req5')),
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
      {/* <LanguageSelector /> */}
      <CustomText type="larger">{t('complete.text1')}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={completionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthSelectField
              name="gender"
              label={t('complete.form.label1')}
              options={[
                { label: t('complete.options.one'), value: 'MALE' },
                { label: t('complete.options.two'), value: 'FEMALE' },
              ]}
              placeholder={t('complete.form.placeholder1')}
            />
            <AuthInputField
              name="age"
              label={t('complete.form.label2')}
              placeholder={t('complete.form.placeholder2')}
              keyboardType="numeric"
            />
            <AuthInputField
              name="address1"
              label={t('complete.form.label3')}
              placeholder={t('complete.form.placeholder3')}
            />
            <AuthInputField
              name="address2"
              label={t('complete.form.label4')}
              placeholder={t('complete.form.placeholder4')}
            />
            <AuthInputField
              name="occupation"
              label={t('complete.form.label5')}
              placeholder={t('complete.form.placeholder5')}
            />
            <AuthInputField
              name="phone"
              label={t('complete.form.label6')}
              placeholder={t('complete.form.placeholder6')}
              keyboardType="phone-pad"
            />
            <AppButton
              title={t('complete.button')}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText={t('complete.loader')}
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