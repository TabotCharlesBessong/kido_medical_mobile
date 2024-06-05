import { CustomText, Notificationcard, PharmacieCard } from "@/components";
import { COLORS } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const index = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => {}}>
            <AntDesign name="bars" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <Image
            source={{ uri: "https://via.placeholder.com/100x40?text=Logo" }}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerRight}>
          <AntDesign name="bells" size={32} color={COLORS.primary} />
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={{ uri: "https://via.placeholder.com/50" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Features Section */}
      <View style={styles.features}>
        <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
          <Text style={styles.featureText}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
          <Text style={styles.featureText}>My Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
          <Text style={styles.featureText}>Find Doctors</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    width: "100%",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 15,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
