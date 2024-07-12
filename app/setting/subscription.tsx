import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const Subscription = () => {
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
        <CustomText type="h2">{t("subscription.title")}</CustomText>
      </View>
      <View style={styles.content}>
        <CustomText type="body1">{t("subscription.current")}</CustomText>
        <CustomText type="h3">{t("subscription.plan")}</CustomText>
        <CustomText type="body1">
          {t("subscription.expires")} 2024-12-31
        </CustomText>
        <TouchableOpacity style={styles.renewButton}>
          <CustomText type="body1">{t("subscription.renew")}</CustomText>
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
  content: {
    padding: 12,
    alignItems: "center",
  },
  infoText: {
    marginVertical: 8,
  },
  planText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 12,
  },
  renewButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  renewButtonText: {
    color: COLORS.white,
  },
});

export default Subscription;
