import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";

interface PostValues {
  title: string;
  description: string;
  image: string;
}

const CreatePostScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { doctorId } = useLocalSearchParams();

  const initialValues: PostValues = {
    title: "",
    description: "",
    image: "",
  };

  const postSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    image: yup.string().url("Invalid URL").required("Image URL is required"),
  });

  const handleSubmit = async (
    values: PostValues,
    actions: FormikHelpers<PostValues>
  ) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await AsyncStorage.getItem("userToken");

      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await instance.post("/post/create", { ...values, doctorId });
      const data = res.data;

      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.status === 200) {
          router.push("/posts");
        }
      }
    } catch (error) {
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <CustomText type="larger">Create Post</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={postSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="title"
              label="Title"
              placeholder="Enter post title"
            />
            <AuthInputField
              name="description"
              label="Description"
              placeholder="Enter post description"
            />
            <AuthInputField
              name="image"
              label="Image URL"
              placeholder="Enter image URL"
            />
            <AppButton
              title="Submit"
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Creating..."
              onPress={handleSubmit}
              containerStyle={{marginTop:24}}
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

export default CreatePostScreen;
