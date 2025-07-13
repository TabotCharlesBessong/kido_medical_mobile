import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker"; // You'll need to install this: `expo install @react-native-picker/picker`
import * as ImagePicker from "expo-image-picker"; // You'll need to install this: `expo install expo-image-picker`

import { AppButton, AuthInputField, CustomText } from "@/components";
import {
  createDoctorProfile,
  clearDoctorProfileError,
} from "@/redux/slice/doctorProfileSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { COLORS } from "@/utils/constants";

interface DoctorProfileValues {
  specialization: string;
  fee: string; // Keep as string for form input, convert to number before dispatch
  documents: string; // Will store the URI or URL after picking/uploading
}

const CreateDoctorProfileScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.doctorProfile
  );

  const [pickedDocumentUri, setPickedDocumentUri] = useState<string | null>(
    null
  );

  useEffect(() => {
    dispatch(clearDoctorProfileError()); // Clear errors on component mount
  }, [dispatch]);

  const initialValues: DoctorProfileValues = {
    specialization: "",
    fee: "",
    documents: "",
  };

  const validationSchema = yup.object({
    specialization: yup
      .string()
      .required(t("doctorProfile.specializationRequired")),
    fee: yup
      .string()
      .required(t("doctorProfile.feeRequired"))
      .matches(/^[0-9]+(\.[0-9]{1,2})?$/, t("doctorProfile.feeInvalid")), // Allows integers or decimals with 1-2 places
    documents: yup.string().required(t("doctorProfile.documentsRequired")), // Requires a document URI/URL
  });

  const pickDocument = async (
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant media library permissions to upload documents."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Or .All to allow PDFs too if backend supports
      allowsEditing: false,
      quality: 1,
      // base64: true, // Only if your backend expects base64 directly
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPickedDocumentUri(uri);
      setFieldValue("documents", uri, true); // Set formik field value and validate

      // In a real application, you'd perform the actual file upload to your backend
      // or a cloud storage (e.g., Cloudinary, AWS S3).
      // This upload would return a public URL, which you'd then use in the `documents` field.
      // For now, we're just storing the local URI.
      // Example of what a real upload might look like (pseudo-code):
      /*
      try {
        const uploadedUrl = await uploadFileToCloud(uri); // Your custom upload function
        setFieldValue('documents', uploadedUrl, true);
      } catch (uploadError) {
        Alert.alert('Upload Failed', 'Could not upload document.');
        setFieldValue('documents', '', true); // Clear field on upload failure
      }
      */
    }
  };

  const handleSubmit = async (
    values: DoctorProfileValues,
    actions: FormikHelpers<DoctorProfileValues>
  ) => {
    if (!pickedDocumentUri) {
      Alert.alert(
        "Document Missing",
        "Please upload your professional documents (e.g., medical license, certificates)."
      );
      return;
    }

    // Convert fee string to number
    const feeAsNumber = parseFloat(values.fee);

    // Dispatch the thunk with the data
    const resultAction = await dispatch(
      createDoctorProfile({
        specialization: values.specialization,
        fee: feeAsNumber,
        documents: pickedDocumentUri, // This should be the actual URL from a file upload service
      })
    );

    if (createDoctorProfile.fulfilled.match(resultAction)) {
      Alert.alert(t("common.success"), t("doctorProfile.submissionSuccess"));
      // You might navigate to a "Pending Verification" screen or home
      router.replace("/(tabs)");
    }
    // Errors are handled by Redux state and displayed in the UI
  };

  // Dummy specializations for the Picker
  const specializations = [
    { label: t("doctorProfile.selectSpecialization"), value: "" },
    { label: t("doctorProfile.gp"), value: "General Practitioner" },
    { label: t("doctorProfile.pediatrician"), value: "Pediatrician" },
    { label: t("doctorProfile.cardiologist"), value: "Cardiologist" },
    { label: t("doctorProfile.dermatologist"), value: "Dermatologist" },
    { label: t("doctorProfile.gynecologist"), value: "Gynecologist" },
    { label: t("doctorProfile.neurologist"), value: "Neurologist" },
    { label: t("doctorProfile.orthopedist"), value: "Orthopedist" },
    { label: t("doctorProfile.psychiatrist"), value: "Psychiatrist" },
    { label: t("doctorProfile.oncologist"), value: "Oncologist" },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1">
          {t("doctorProfile.title")}
        </CustomText>
        <CustomText type="body2">
          {t("doctorProfile.subtitle")}
        </CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Specialization Picker */}
              <View style={styles.pickerContainer}>
                <CustomText type="body4">
                  {t("doctorProfile.specializationLabel")}
                </CustomText>
                <Picker
                  selectedValue={values.specialization}
                  onValueChange={(itemValue) =>
                    setFieldValue("specialization", itemValue)
                  }
                  style={styles.picker}
                >
                  {specializations.map((item, index) => (
                    <Picker.Item
                      key={index}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
                {touched.specialization && errors.specialization && (
                  <Text style={styles.errorText}>{errors.specialization}</Text>
                )}
              </View>

              <AuthInputField
                name="fee"
                label={t("doctorProfile.feeLabel")}
                placeholder={t("doctorProfile.feePlaceholder")}
                keyboardType="numeric"
                containerStyle={styles.inputField}
              />

              {/* Document Upload */}
              <View style={styles.documentUploadContainer}>
                <AppButton
                  title={t("doctorProfile.uploadDocumentsButton")}
                  onPress={() => pickDocument(setFieldValue)}
                  backgroundColor={COLORS.lightGray}
                  textColor={COLORS.dark}
                  containerStyle={styles.uploadButton}
                />
                {pickedDocumentUri ? (
                  <Text style={styles.documentUriText}>
                    {t("doctorProfile.documentSelected")}:{" "}
                    {pickedDocumentUri.split("/").pop()}
                  </Text>
                ) : (
                  touched.documents &&
                  errors.documents && (
                    <Text style={styles.errorText}>{errors.documents}</Text>
                  )
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t("doctorProfile.submitButton")}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t("doctorProfile.loading")}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateDoctorProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    maxWidth: 450, // Max width for tablet views
    alignItems: "center",
  },
  inputField: {
    marginBottom: 15,
    width: "100%",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background, // A lighter background for the picker
  },
  pickerLabel: {
    paddingLeft: 10,
    paddingTop: 8,
    color: COLORS.dark, // A clear color for the label
  },
  picker: {
    width: "100%",
    height: 50,
    color: COLORS.text, // Text color inside the picker
  },
  documentUploadContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  uploadButton: {
    width: "80%",
    marginBottom: 10,
  },
  documentUriText: {
    marginTop: 5,
    color: COLORS.success,
    textAlign: "center",
    fontSize: 12,
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
