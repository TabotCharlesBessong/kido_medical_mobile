import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const DataSaver = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);

  const toggleDataSaver = () => {
    setIsDataSaverEnabled(!isDataSaverEnabled);
  };

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
        <CustomText type="h2">{t("dataSaver.title")}</CustomText>
      </View>
      <View style={styles.content}>
        <View style={styles.optionContainer}>
          <CustomText type="body1">{t("dataSaver.enable")}</CustomText>
          <Switch
            value={isDataSaverEnabled}
            onValueChange={toggleDataSaver}
            thumbColor={isDataSaverEnabled ? COLORS.primary : COLORS.gray}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
          />
        </View>
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
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default DataSaver;
