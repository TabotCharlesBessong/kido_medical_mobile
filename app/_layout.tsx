import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity } from "react-native";
import { OnboardingScreen, SplashScreenComponent } from "@/components";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/redux/store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterBlack: require("../assets/fonts/Inter-Black.ttf"),
    InterBold: require("../assets/fonts/Inter-Bold.ttf"),
    InterExtraBold: require("../assets/fonts/Inter-ExtraBold.ttf"),
    InterExtraLight: require("../assets/fonts/Inter-ExtraBold.ttf"),
    InterLight: require("../assets/fonts/Inter-Light.ttf"),
    InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
    InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
    InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
    InterThin: require("../assets/fonts/Inter-Thin.ttf"),
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

  return (
    <Provider store={store} >
      <PersistGate loading={null} persistor={persistor} >

      <RootLayoutNav />
      </PersistGate>
    </Provider>
)
}

function RootLayoutNav() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<true>(true)

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  }, []);

  // if (showSplash) {
  //   return <SplashScreenComponent />;
  // }
  // if(showOnboarding){
  //   return <OnboardingScreen />
  // }


  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        {/* <Stack.Screen name="(tabs)" options={{headerShown:false}} />
        <Stack.Screen name="index" options={{ headerShown: false }} /> */}
        <Stack.Screen
          name="auth/register"
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
          name="auth/login"
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
          name="auth/forgot"
          options={{
            title: "Forgot Screen",
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
          name="doctor/profile"
          options={{
            title: "Profile Screen",
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
          name="doctor/book-appointment"
          options={{
            title: "Booking Screen",
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
