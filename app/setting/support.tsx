import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const Support = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="keyboard-arrow-left"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
        <CustomText type="h2">{t("support.title")}</CustomText>
      </View>
      <View style={styles.form}>
        <CustomText type="body1">{t("support.help")}</CustomText>
        <TextInput
          style={styles.input}
          placeholder={t("support.placeholder")}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.submitButton}>
          <CustomText type="body1">{t("support.submit")}</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
  },
  backButton: {},
  form: {
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
  },
});

export default Support;
