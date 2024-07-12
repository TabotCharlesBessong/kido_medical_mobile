import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const TermsAndPolicies = () => {
  const router = useRouter();

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
        <CustomText type="h2">Terms and Policies</CustomText>
      </View>
      <ScrollView style={styles.scrollView}>
        <CustomText type="h3">
          Introduction
        </CustomText>
        <CustomText type="body1">
          Welcome to our telemedicine platform. By using our services, you agree
          to the following terms and conditions.
        </CustomText>

        <CustomText type="h3">
          Privacy Policy
        </CustomText>
        <CustomText type="body1">
          Your privacy is important to us. We are committed to protecting your
          personal information and ensuring its confidentiality.
        </CustomText>

        <CustomText type="h3">
          User Responsibilities
        </CustomText>
        <CustomText type="body1">
          Users are expected to provide accurate information and comply with the
          guidelines provided by our healthcare professionals.
        </CustomText>

        <CustomText type="h3">
          Limitation of Liability
        </CustomText>
        <CustomText type="body1">
          Our platform is not responsible for any damages arising from the use
          of our services. Users should seek immediate medical attention in
          emergencies.
        </CustomText>

        <CustomText type="h3">
          Contact Information
        </CustomText>
        <CustomText type="body1">
          If you have any questions or concerns, please contact us at
          support@telemedicine.com.
        </CustomText>
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
  backButton: {},
  headerTitle: {
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 12,
  },
  sectionTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  sectionText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default TermsAndPolicies;
