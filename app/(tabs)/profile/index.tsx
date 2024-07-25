import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton, CustomText, LoadingOverlay } from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { IUser } from "@/constants/types";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const getData = async (): Promise<IUser | null> => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const parsedData: IUser = JSON.parse(data);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedData = await getData();
      if (fetchedData) {
        setUser(fetchedData);
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingOverlay />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ width: "90%", height: 280 }}>
          <Image
            source={require("../../../assets/images/doctor1.jpg")}
            style={{ width: 250, height: 250, borderRadius: 125 }}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text1")}: </CustomText>
            <CustomText type="body2">{user.username}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text2")}: </CustomText>
            <CustomText type="body2">{user.firstname}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text3")}: </CustomText>
            <CustomText type="body2">{user.lastname}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text4")}: </CustomText>
            <CustomText type="body2">{user.email}</CustomText>
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text5")}: </CustomText>
            {user.isEmailVerified ? (
              <AntDesign name="checkcircle" size={28} color={COLORS.primary} />
            ) : (
              <MaterialIcons name="cancel" size={28} color={COLORS.danger} />
            )}
          </View>
          <View style={styles.infoItem}>
            <CustomText type="body1">{t("profile.text6")}: </CustomText>
            <CustomText type="body2">
              {new Date(user.createdAt).toDateString()}
            </CustomText>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <AppButton
            title={t("profile.button1")}
            onPress={() => router.push("/profile/complete")}
            backgroundColor={COLORS.primary}
            width={"45%"}
          />
          <AppButton
            title={t("profile.button2")}
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
    marginTop: -32,
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
