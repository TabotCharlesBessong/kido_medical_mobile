import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter()

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        {/* <Stack.Screen name="(tabs)" options={{headerShown:false}} />
        <Stack.Screen name="index" options={{ headerShown: false }} /> */}
        <Stack.Screen
          name="register"
          options={{
            title: "Register Screen",
            headerBackTitle: "",
            headerShadowVisible: false,
            headerStyle: {},
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={36} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Login Screen",
            headerBackTitle: "",
            headerShadowVisible: false,
            headerStyle: {},
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={36} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            title: "",
            headerBackTitle: "",
            headerShadowVisible: false,
            headerStyle: {},
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={36} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </>
  );
}
