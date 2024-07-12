import React from "react";
import { View, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [emailNotifications, setEmailNotifications] = React.useState(false);
  const [pushNotifications, setPushNotifications] = React.useState(false);

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
        <CustomText type="h2">{t("notifications.title")}</CustomText>
      </View>
      <View style={styles.settings}>
        <View style={styles.settingItem}>
          <CustomText type="body1">{t("notifications.email")}</CustomText>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </View>
        <View style={styles.settingItem}>
          <CustomText type="body1">{t("notifications.push")}</CustomText>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
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
  settings: {
    padding: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
});

export default Notifications;
