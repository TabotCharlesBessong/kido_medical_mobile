import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, AuthInputField, CustomText } from "@/components";
import {
  fetchSingleConsultation,
  updateConsultation,
  clearConsultationError,
  clearCurrentConsultation, // To clear the state when leaving the screen
} from "@/redux/slice/consultationSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { UpdateConsultationPayload } from "@/constants/types/consultation";
import { COLORS } from "@/utils/constants";

const ConsultationDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();

  const { currentConsultation, isLoading, error } = useSelector(
    (state: RootState) => state.consultation
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (consultationId) {
      dispatch(fetchSingleConsultation(consultationId));
    }
    return () => {
      // Clean up current consultation state when component unmounts
      dispatch(clearCurrentConsultation());
      dispatch(clearConsultationError());
    };
  }, [dispatch, consultationId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearConsultationError());
    }
  }, [error, dispatch, t]);

  const validationSchema = yup.object({
    presentingComplaints: yup
      .string()
      .required(t("consultation.complaintsRequired")),
    diagnosticImpression: yup
      .string()
      .required(t("consultation.diagnosisRequired")),
    investigations: yup
      .string()
      .required(t("consultation.investigationsRequired")),
    treatment: yup.string().required(t("consultation.treatmentRequired")),
    pastHistory: yup.string().required(t("consultation.pastHistoryRequired")),
  });

  const handleSubmit = async (
    values: UpdateConsultationPayload,
    actions: FormikHelpers<UpdateConsultationPayload>
  ) => {
    if (!consultationId) {
      Alert.alert(t("common.error"), t("consultation.noConsultationId"));
      return;
    }

    const resultAction = await dispatch(
      // @ts-ignore
      updateConsultation({ consultationId, payload: values })
    );

    if (updateConsultation.fulfilled.match(resultAction)) {
      Alert.alert(t("common.success"), t("consultation.updateSuccess"));
      setIsEditing(false); // Exit editing mode
    }
  };

  if (isLoading && !currentConsultation) {
    // Show loading only if no consultation data yet
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingConsultationDetails")}
        </CustomText>
      </View>
    );
  }

  if (!currentConsultation) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>
          {t("consultation.consultationNotFound")}
        </CustomText>
        <AppButton
          title={t("common.goBack")}
          onPress={() => router.back()}
          backgroundColor={COLORS.primary}
          containerStyle={{ marginTop: 20, width: "50%" }}
        />
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
          {t("consultation.consultationDetailTitle")}
        </CustomText>

        <View style={styles.detailCard}>
          <CustomText type="h4" style={styles.cardHeader}>
            {t("consultation.patient")}:{" "}
            {currentConsultation.patient?.firstname || "N/A"}{" "}
            {currentConsultation.patient?.lastname || ""}
          </CustomText>
          <CustomText type="body3">
            {t("consultation.date")}:{" "}
            {new Date(currentConsultation.createdAt).toLocaleString()}
          </CustomText>
        </View>

        <Formik
        // @ts-ignore
          initialValues={{
            presentingComplaints: currentConsultation.presentingComplaints,
            diagnosticImpression: currentConsultation.diagnosticImpression,
            investigations: currentConsultation.investigations,
            treatment: currentConsultation.treatment,
            pastHistory: currentConsultation.pastHistory,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Important to update form with fetched data
        >
          {({ handleSubmit, errors, touched }) => (
            <View style={styles.form}>
              <AuthInputField
                name="presentingComplaints"
                label={t("consultation.complaintsLabel")}
                placeholder={t("consultation.complaintsPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
              <AuthInputField
                name="diagnosticImpression"
                label={t("consultation.diagnosisLabel")}
                placeholder={t("consultation.diagnosisPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
              <AuthInputField
                name="investigations"
                label={t("consultation.investigationsLabel")}
                placeholder={t("consultation.investigationsPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
              <AuthInputField
                name="treatment"
                label={t("consultation.treatmentLabel")}
                placeholder={t("consultation.treatmentPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
              <AuthInputField
                name="pastHistory"
                label={t("consultation.pastHistoryLabel")}
                placeholder={t("consultation.pastHistoryPlaceholder")}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              {isEditing ? (
                <AppButton
                  title={t("common.saveChanges")}
                  onPress={handleSubmit}
                  backgroundColor={COLORS.primary}
                  loading={isLoading}
                  loadingText={t("common.saving")}
                  containerStyle={styles.submitButton}
                />
              ) : (
                <AppButton
                  title={t("common.edit")}
                  onPress={() => setIsEditing(true)}
                  backgroundColor={COLORS.secondary}
                  textColor={COLORS.dark}
                  containerStyle={styles.submitButton}
                />
              )}
              <AppButton
                title={t("prescription.createButton")}
                onPress={() =>
                  router.push({
                    // @ts-ignore
                    pathname: "/doctor/create-prescription",
                    params: { consultationId: currentConsultation.id },
                  })
                }
                backgroundColor={COLORS.success}
                containerStyle={styles.submitButton}
                loading={isLoading}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ConsultationDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  detailCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    maxWidth: 450,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: 10,
    color: COLORS.dark,
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
