import React from "react";
import { View, StyleSheet, Button, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {AppButton, CustomText} from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { IUser } from "@/constants/types";
import { mockUser } from "@/constants/data/user";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const user:IUser = mockUser
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ width: "90%", height: 280 }}>
          <Image
            source={require("../../../assets/images/doctor.jpeg")}
            style={{ width: 250, height: 250, borderRadius: 125 }}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <CustomText type="body1">Username: </CustomText>
            <CustomText type="body2">{user.username}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">First Name: </CustomText>
            <CustomText type="body2">{user.firstname}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">Last Name: </CustomText>
            <CustomText type="body2">{user.lastname}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">Email: </CustomText>
            <CustomText type="body2">{user.email}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">Account Status: </CustomText>
            {user.isEmailVerified ? (
              <AntDesign name="checkcircle" size={28} color={COLORS.primary} />
            ) : (
              <MaterialIcons name="cancel" size={28} color={COLORS.danger} />
            )}
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">Created At: </CustomText>
            <CustomText type="body2">
              {user.createdAt.toDateString()}
            </CustomText>
          </View>
          {/* <View style={styles.infoItem}>
            <CustomText type="body1">Created At: </CustomText>
            <CustomText type="body2">
              {user.createdAt.toDateString()}
            </CustomText>
          </View> */}
        </View>
        <View style={styles.buttonContainer}>
          <AppButton
            title="Add Patient Information"
            onPress={() => router.push("/profile/complete")}
            backgroundColor={COLORS.primary}
            width={"45%"}
          />
          <AppButton
            title="Register as Doctor"
            onPress={() => router.push("/profile/register")}
            backgroundColor={COLORS.primary}
            width={"45%"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop:-32
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  infoItem: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});

export default ProfileScreen;
