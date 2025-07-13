// utils/logout.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const logout = async () => {
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("userData");
  router.replace("/auth/login");
};
