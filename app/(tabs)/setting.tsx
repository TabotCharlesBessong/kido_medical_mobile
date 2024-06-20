import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import React, { FC, ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomText } from "@/components";

interface SettingItemsProps {
  icon:string,
  text:string
  action:() => void
}

const SettingsScreen = () => {
  const router = useRouter();

  const navigateToEditProfile = () => {
    router.push("/EditProfile");
  };

  const navigateToSecurity = () => {
    router.push("/Security");
  };

  const navigateToNotifications = () => {
    router.push("/Notifications");
  };

  const navigateToPrivacy = () => {
    router.push("/Privacy");
  };

  const navigateToSubscription = () => {
    router.push("/Subscription");
  };

  const navigateToSupport = () => {
    router.push("/Support");
  };

  const navigateToTermsAndPolicies = () => {
    router.push("/TermsAndPolicies");
  };

  const navigateToFreeSpace = () => {
    router.push("/FreeSpace");
  };

  const navigateToDataSaver = () => {
    router.push("/DataSaver");
  };

  const navigateToReportProblem = () => {
    router.push("/ReportProblem");
  };

  const addAccount = () => {
    router.push("/AddAccount");
  };

  const logout = () => {
    router.push("/Logout");
  };

  const accountItems = [
    {
      icon: "person-outline",
      text: "Edit Profile",
      action: navigateToEditProfile,
    },
    { icon: "security", text: "Security", action: navigateToSecurity },
    {
      icon: "notifications-none",
      text: "Notifications",
      action: navigateToNotifications,
    },
    { icon: "lock-outline", text: "Privacy", action: navigateToPrivacy },
  ];

  const supportItems = [
    {
      icon: "credit-card",
      text: "My Subscription",
      action: navigateToSubscription,
    },
    { icon: "help-outline", text: "Help & Support", action: navigateToSupport },
    {
      icon: "info-outline",
      text: "Terms and Policies",
      action: navigateToTermsAndPolicies,
    },
  ];

  const cacheAndCellularItems = [
    {
      icon: "delete-outline",
      text: "Free up space",
      action: navigateToFreeSpace,
    },
    { icon: "save-alt", text: "Data Saver", action: navigateToDataSaver },
  ];

  const actionsItems = [
    {
      icon: "outlined-flag",
      text: "Report a problem",
      action: navigateToReportProblem,
    },
    { icon: "people-outline", text: "Add Account", action: addAccount },
    { icon: "logout", text: "Log out", action: logout },
  ];

  const renderSettingsItem:FC<SettingItemsProps> = ({ icon, text, action }) => (
    <TouchableOpacity key={text} onPress={action} style={styles.settingsItem}>
      <MaterialIcons name={icon} size={24} color="black" />
      <CustomText type="body1">
        {text}
      </CustomText>
    </TouchableOpacity>
  );

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
        <CustomText type="h2" >
          Settings
        </CustomText>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Account Settings */}
        <View style={styles.section}>
          <CustomText type="h4" >
            Account
          </CustomText>
          {accountItems.map(renderSettingsItem)}
        </View>

        {/* Support and About settings */}
        <View style={styles.section}>
          <CustomText type="h4" >
            Support & About
          </CustomText>
          {supportItems.map(renderSettingsItem)}
        </View>

        {/* Cache & Cellular */}
        <View style={styles.section}>
          <CustomText type="h4" >
            Cache & Cellular
          </CustomText>
          {cacheAndCellularItems.map(renderSettingsItem)}
        </View>

        {/* Actions Settings */}
        <View style={styles.section}>
          <CustomText type="h4" >
            Actions
          </CustomText>
          {actionsItems.map(renderSettingsItem)}
        </View>
      </ScrollView>
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
  backButton: {
    // position: "absolute",
    // left: 0,
  },
  headerTitle: {
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginVertical: 10,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    marginVertical: 5,
  },
  settingsText: {
    marginLeft: 40,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SettingsScreen;
