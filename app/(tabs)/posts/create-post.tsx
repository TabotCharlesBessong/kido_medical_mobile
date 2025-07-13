import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker"; // For image upload

import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/utils/constants";
import { createPost, clearPostsError } from "@/redux/slice/postsSlice";
import { AppDispatch, RootState } from "@/redux/store";

interface CreatePostValues {
  title: string;
  image: string; // Will store image URI/URL
  description: string;
}

const CreatePostScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // To check user role

  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a doctor
    if (authUser?.role !== "DOCTOR") {
      Alert.alert(t("common.accessDenied"), t("posts.doctorOnlyAccess"));
      // @ts-ignore
      router.replace("/(tabs)/");
      return;
    }
    dispatch(clearPostsError());
  }, [dispatch, authUser, router, t]);

  const initialValues: CreatePostValues = {
    title: "",
    image: "",
    description: "",
  };

  const validationSchema = yup.object({
    title: yup.string().required(t("posts.titleRequired")),
    description: yup.string().required(t("posts.descriptionRequired")),
    image: yup.string().nullable(), // Image is optional but if provided, must be valid URI/URL
  });

  const pickImage = async (
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.permissionRequired"),
        t("common.mediaPermissionPrompt")
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow basic editing (crop)
      aspect: [16, 9], // Aspect ratio for blog posts
      quality: 0.7,
      // base64: true, // Only if your backend expects base64
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPickedImageUri(uri);
      setFieldValue("image", uri, true); // Set Formik field

      // IMPORTANT: In a real app, you would UPLOAD this image (uri) to a cloud storage
      // (e.g., Cloudinary, AWS S3) from here or via your backend.
      // The `setFieldValue('image', uploadedUrl)` would then use the URL returned by the cloud.
      // For now, it sends the local URI, which your backend might not accept directly.
    }
  };

  const handleSubmit = async (
    values: CreatePostValues,
    actions: FormikHelpers<CreatePostValues>
  ) => {
    // Ensure image is a valid URL if it's not a local URI from a real upload service
    const imageUrlToSend = values.image || undefined; // Or a placeholder if no image

    const resultAction = await dispatch(
      createPost({
        title: values.title,
        description: values.description,
        image: imageUrlToSend, // Should be an uploaded URL
      })
    );

    if (createPost.fulfilled.match(resultAction)) {
      Alert.alert(t("common.success"), t("posts.postCreatedSuccess"));
      actions.resetForm();
      setPickedImageUri(null); // Clear image preview
      // @ts-ignore
      router.replace("/(tabs)/"); // Go back to the posts list
    }
    // Errors are handled by Redux state and displayed
  };

  if (authUser?.role !== "DOCTOR") {
    return (
      <View style={styles.accessDeniedContainer}>
        <CustomText type="h2">{t("common.accessDenied")}</CustomText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>
          {t("posts.createPostTitle")}
        </CustomText>
        <CustomText type="body2" style={styles.subtitle}>
          {t("posts.createPostSubtitle")}
        </CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              <AuthInputField
                name="title"
                label={t("posts.titleLabel")}
                placeholder={t("posts.titlePlaceholder")}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="description"
                label={t("posts.descriptionLabel")}
                placeholder={t("posts.descriptionPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={5}
              />

              {/* Image Picker */}
              <View style={styles.imagePickerContainer}>
                <AppButton
                  title={t("posts.selectImageButton")}
                  onPress={() => pickImage(setFieldValue)}
                  backgroundColor={COLORS.secondary}
                  textColor={COLORS.dark}
                  containerStyle={styles.selectImageButton}
                  titleStyle={styles.selectImageButtonTitle}
                />
                {pickedImageUri && (
                  <Image
                    source={{ uri: pickedImageUri }}
                    style={styles.pickedImage}
                  />
                )}
                {touched.image && errors.image && (
                  <Text style={styles.errorText}>{errors.image}</Text>
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t("posts.submitPostButton")}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t("common.loading")}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  header: {
    marginBottom: 10,
    textAlign: "center",
    color: COLORS.primary,
  },
  subtitle: {
    marginBottom: 30,
    textAlign: "center",
    color: COLORS.gray,
  },
  form: {
    width: "100%",
    maxWidth: 450,
    alignItems: "center",
  },
  inputField: {
    marginBottom: 15,
    width: "100%",
  },
  imagePickerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  selectImageButton: {
    width: "80%",
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  selectImageButtonTitle: {
    fontSize: 16,
  },
  pickedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover",
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: "center",
    width: "100%",
    fontSize: 12,
  },
  submitButton: {
    width: "100%",
    marginTop: 20,
  },
});
