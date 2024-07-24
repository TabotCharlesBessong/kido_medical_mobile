import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
// import { logout } from "@/store/slices/authSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Logout = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // dispatch(logout());
    AsyncStorage.removeItem("userData")
    AsyncStorage.removeItem("userToken")
    router.replace("/auth/login");
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
        <CustomText type="h2">{t("logout.title")}</CustomText>
      </View>
      <View style={styles.content}>
        <CustomText type="body1">{t("logout.confirmation")}</CustomText>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <CustomText type="body1">{t("logout.logoutButton")}</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <CustomText type="body1">{t("logout.cancelButton")}</CustomText>
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
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: COLORS.white,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: COLORS.primary,
  },
});

export default Logout;
