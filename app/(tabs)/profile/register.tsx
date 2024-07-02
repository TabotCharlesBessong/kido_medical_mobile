// DoctorRegistrationScreen.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { RegisterDoctorValues } from "@/constants/types";
import { AppButton, AuthInputField, AuthSelectField } from "@/components";
import { COLORS } from "@/constants/theme";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Formik, FormikHelpers } from "formik";
import { AppDispatch, RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerDoctor } from "@/redux/actions/doctor.action";

const DoctorRegistrationScreen: React.FC = () => {
  const { loading, error } = useSelector((state: RootState) => state.doctor);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const initialValues: RegisterDoctorValues = {
    name: "",
    specialization: "",
    location: "",
    experience: 0,
    language: "",
    fee: 0,
    documents: "",
  };

  const doctorRegistrationSchema = yup.object({
    name: yup.string().required("Name is required"),
    specialization: yup.string().required("Speciality is required"),
    location: yup.string().required("Location is required"),
    documents: yup.string().required("Documents are required"),
    experience: yup
      .number()
      .required("Experience is required")
      .min(0, "Experience must be a positive number"),
    language: yup.string().required("Language is required"),
    fee: yup
      .number()
      .required("Fee is required")
      .min(0, "Fee must be a positive number"),
  });

  const handleSubmit = async (
    values: RegisterDoctorValues,
    actions: FormikHelpers<RegisterDoctorValues>
  ) => {
    dispatch(registerDoctor(values)).then((action) => {
      if (registerDoctor.fulfilled.match(action)) {
        router.push("(tabs)");
      }
    });
  };

  useEffect(() => {
    const token = AsyncStorage.getItem("userToken")
    const data = AsyncStorage.getItem("userData")
    console.log({token,data})
  },[])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={doctorRegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView>
            <AuthInputField
              name="specialization"
              label="Specialization"
              placeholder="Enter your specialization"
            />
            <AuthInputField
              name="documents"
              label="Documents"
              placeholder="Enter your documents"
            />
            <AuthInputField
              name="experience"
              label="Experience"
              placeholder="Enter your experience"
              keyboardType="numeric"
            />
            <AuthInputField
              name="fee"
              label="Fee"
              placeholder="Enter your fee"
              keyboardType="numeric"
            />
            <AuthSelectField
              name="language"
              label="Language"
              placeholder="Select languages"
              options={[
                { label: "English", value: "English" },
                { label: "French", value: "French" },
                { label: "Spanish", value: "Spanish" },
                { label: "German", value: "German" },
              ]}
            />
            <AppButton
              containerStyle={{ marginTop: 24 }}
              title="Submit"
              onPress={handleSubmit}
              width={"100%"}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Registering...."
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </KeyboardAvoidingView>
        )}
      </Formik>
    </ScrollView>
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

export default DoctorRegistrationScreen;
