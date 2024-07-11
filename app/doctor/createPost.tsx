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
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation()

  const initialValues: PostValues = {
    title: "",
    description: "",
    image: "",
  };

  const postSchema = yup.object().shape({
    title: yup.string().required(t("createPost.validation.titleRequired")),
    description: yup
      .string()
      .required(t("createPost.validation.descriptionRequired")),
    image: yup
      .string()
      .url(t("createPost.validation.invalidImageUrl"))
      .required(t("createPost.validation.imageUrlRequired")),
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
              label={t("createPost.fields.title")}
              placeholder={t("createPost.placeholders.title")}
            />
            <AuthInputField
              name="description"
              label={t("createPost.fields.description")}
              placeholder={t("createPost.placeholders.description")}
            />
            <AuthInputField
              name="image"
              label={t("createPost.fields.image")}
              placeholder={t("createPost.placeholders.image")}
            />
            <AppButton
              title={t("createPost.buttons.submit")}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText="Creating..."
              onPress={handleSubmit}
              containerStyle={{ marginTop: 24 }}
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
