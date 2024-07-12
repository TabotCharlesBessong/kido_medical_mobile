import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{t("profiled.back")}</Text>
        </TouchableOpacity>
        <CustomText type="h1">{t("profiled.doctorProfile")}</CustomText>
      </View>
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: "../../assets/images/doctor.jpeg" }}
          style={styles.profileImage}
        />
      </View>
      <CustomText type="h2">Ebot Bessong</CustomText>
      <View style={styles.infoContainer}>
        <CustomText type="body2">{t("profiled.speciality")}</CustomText>
        <CustomText type="h4">Generalist</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">{t("profiled.location")}</CustomText>
        <CustomText type="h4">Douala Cameroon</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">{t("profiled.experience")}</CustomText>
        <CustomText type="h4">3+ years</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">{t("profiled.languages")}</CustomText>
        <CustomText type="h4">English, French</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">{t("profiled.consultationFee")}</CustomText>
        <CustomText type="h4">22000 XAF</CustomText>
      </View>
      <View>
        <CustomText type="body2">{t("profiled.summary")}</CustomText>
        <CustomText type="h4">{t("profiled.description")}</CustomText>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/doctor/book-appointment")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>{t("profiled.bookAppointment")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/consult")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>{t("profiled.consultPatient")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/prescribe")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>
          {t("profiled.prescribeToPatient")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/prescriptions")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>{t("profiled.viewPrescriptions")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/createPost")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>{t("profiled.createPost")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/timeslot")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t("profiled.timeSlot")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    color: "#007bff",
    marginRight: 20,
    fontSize: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  speciality: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
