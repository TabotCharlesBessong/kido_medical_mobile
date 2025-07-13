// import React from "react";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { useFonts } from "expo-font";
// import { Stack, useRouter } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect, useState } from "react";

// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { TouchableOpacity } from "react-native";
// import { OnboardingScreen, SplashScreenComponent } from "@/components";
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import { persistor, store } from "@/redux/store";
// import "../i18n/i18n.config";
// import { ToastProvider } from "react-native-toast-notifications";
// import 'react-native-gesture-handler';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary
// } from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "(tabs)",
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [loaded, error] = useFonts({
//     InterBlack: require("../assets/fonts/Inter-Black.ttf"),
//     InterBold: require("../assets/fonts/Inter-Bold.ttf"),
//     InterExtraBold: require("../assets/fonts/Inter-ExtraBold.ttf"),
//     InterExtraLight: require("../assets/fonts/Inter-ExtraBold.ttf"),
//     InterLight: require("../assets/fonts/Inter-Light.ttf"),
//     InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
//     InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
//     InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
//     InterThin: require("../assets/fonts/Inter-Thin.ttf"),
//     ...FontAwesome.font,
//   });

//   // Expo Router uses Error Boundaries to catch errors in the navigation tree.
//   useEffect(() => {
//     if (error) throw error;
//   }, [error]);

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <ToastProvider>
//           <RootLayoutNav />
//         </ToastProvider>
//       </PersistGate>
//     </Provider>
//   );
// }

// function RootLayoutNav() {
//   const router = useRouter();
//   const [showSplash, setShowSplash] = useState<boolean>(true);
//   const [showOnboarding, setShowOnboarding] = useState<true>(true);

//   useEffect(() => {
//     setTimeout(() => {
//       setShowSplash(false);
//     }, 3000);
//   }, []);

//   // if (showSplash) {
//   //   return <SplashScreenComponent />;
//   // }
//   // if(showOnboarding){
//   //   return <OnboardingScreen />
//   // }

//   return (
//     <>
//       <StatusBar style="auto" />
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="index" options={{ headerShown: false }} />
//         <Stack.Screen
//           name="auth/register"
//           options={{
//             title: "Register Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="auth/login"
//           options={{
//             title: "Login Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="auth/forgot"
//           options={{
//             title: "Forgot Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="doctor/profile"
//           options={{
//             title: "Profile Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="doctor/prescribe"
//           options={{
//             title: "Prescription Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="doctor/consult"
//           options={{
//             title: "Consultation Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="doctor/book-appointment"
//           options={{
//             title: "Booking Screen",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="doctor/postDetail"
//           options={{
//             title: "Post Details",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Stack.Screen
//           name="home"
//           options={{
//             title: "",
//             headerBackTitle: "",
//             headerShadowVisible: false,
//             headerStyle: {},
//             headerLeft: () => (
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Ionicons name="arrow-back" size={36} color="black" />
//               </TouchableOpacity>
//             ),
//           }}
//         />
//       </Stack>
//     </>
//   );
// }


import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, AppDispatch, RootState } from "@/redux/store";
import { loadUserFromStorage } from "@/redux/slice/authSlice";
import {
  connectStreamUser,
  disconnectStreamUser,
} from "@/redux/slice/streamSlice"; // Stream Video client management
import { useDispatch, useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, StyleSheet, Alert } from "react-native";

// Stream Video SDK components
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
// Removed Stream Chat SDK imports

// Required polyfills (ensure these are at the very top of your entry file like App.tsx or index.js/ts)
// For Expo Router, often best placed directly here or in a separate polyfills.ts imported early.
import "react-native-url-polyfill/auto";
import "core-js/full/symbol/iterator";
// If you encounter `TextEncoder` or `Buffer` issues:
// import 'fast-text-encoding';
// import { Buffer } from 'buffer';
// (global as any).Buffer = Buffer;

function RootNavigatorWrapper() {
  const dispatch: AppDispatch = useDispatch();
  const {
    user,
    token: appAuthToken,
    isLoading: authLoading,
    error: authError,
  } = useSelector((state: RootState) => state.auth);
  const {
    videoClient,
    isConnected: streamConnected,
    isLoading: streamLoading,
    error: streamError,
  } = useSelector((state: RootState) => state.stream);

  const [isAppReady, setIsAppReady] = React.useState(false);

  // 1. Load app user from storage
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
      } catch (e) {
        console.warn("No existing user session or failed to load:", e);
      } finally {
        setIsAppReady(true);
      }
    };
    prepareApp();

    // Cleanup: Disconnect Stream user on app close or if session ends externally
    return () => {
      if (streamConnected) {
        dispatch(disconnectStreamUser());
      }
    };
  }, [dispatch, streamConnected]);

  // 2. Connect to Stream Video client once app user is loaded and authenticated
  useEffect(() => {
    if (
      isAppReady &&
      user &&
      appAuthToken &&
      !streamConnected &&
      !streamLoading
    ) {
      dispatch(connectStreamUser(user.id));
    }
    // Handle disconnection if user logs out or appAuthToken disappears
    if (isAppReady && !user && streamConnected) {
      dispatch(disconnectStreamUser());
    }
  }, [
    isAppReady,
    user,
    appAuthToken,
    streamConnected,
    streamLoading,
    dispatch,
  ]);

  // Handle Stream errors
  useEffect(() => {
    if (streamError) {
      Alert.alert("Stream Error", streamError);
    }
  }, [streamError]);

  // If the app is still loading user data or connecting to Stream, show a splash/loading screen
  if (!isAppReady || authLoading || streamLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>
          {authLoading
            ? "Authenticating..."
            : "Connecting to video services..."}
        </Text>
      </View>
    );
  }

  // If authenticated and Stream Video client is connected, render the main app
  if (user && appAuthToken && streamConnected && videoClient) {
    return (
      // Only Stream Video Context Provider
      <StreamVideo client={videoClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Global call screen outside tabs, presented as a full-screen modal */}
          <Stack.Screen
            name="calls/[streamCallId]"
            options={{ headerShown: false, presentation: "fullScreenModal" }}
          />
        </Stack>
      </StreamVideo>
    );
  }

  // If not authenticated or Stream failed to connect, redirect to auth flow
  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Main App component wrapping with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <RootNavigatorWrapper />
      <StatusBar style="auto" />
    </Provider>
  );
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

