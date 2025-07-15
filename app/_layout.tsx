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


// app/_layout.tsx

import React, { useEffect } from "react";
import { Stack, Redirect } from "expo-router"; // Import Redirect for unauthenticated users
import { Provider } from "react-redux";
import { store, AppDispatch, RootState } from "@/redux/store";
import {
  loadUserFromStorage,
  logout as authLogout, // Alias logout to avoid conflict if needed
} from "@/redux/slice/authSlice";
import {
  connectStreamUser,
  disconnectStreamUser,
  getGlobalStreamVideoClient,
} from "@/redux/slice/streamSlice";
import { useDispatch, useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, StyleSheet, Alert } from "react-native";

// Stream Video SDK components
import { StreamVideo } from "@stream-io/video-react-native-sdk";

// Polyfills - ensure these are at the very top of your project's entry point
// For Expo Router, placing them here in app/_layout.tsx is usually effective.
import "react-native-url-polyfill/auto";
import "core-js/full/symbol/iterator";
// If you encounter `TextEncoder` or `Buffer` issues, uncomment these:
// import 'fast-text-encoding';
// import { Buffer } from 'buffer';
// (global as any).Buffer = Buffer;

// This component handles the core app logic, Redux state loading, and Stream.io connection.
function AppRootLayout() {
  const dispatch: AppDispatch = useDispatch();
  const {
    user,
    token: appAuthToken, // JWT token from your backend
    isLoading: authLoading,
    error: authError,
  } = useSelector((state: RootState) => state.auth);
  const {
    isConnected: streamConnected, // Stream Video client connected status
    isLoading: streamLoading, // Stream Video client connection loading
    error: streamError, // Stream Video client connection error
  } = useSelector((state: RootState) => state.stream);

  const [isAppReady, setIsAppReady] = React.useState(false); // Tracks if initial app data is loaded

  // 1. Load user authentication data from secure storage on app launch
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap(); // Attempt to load user from SecureStore
      } catch (e) {
        console.warn("No existing user session or failed to load:", e);
      } finally {
        setIsAppReady(true); // Mark app as ready to proceed with routing
      }
    };
    prepareApp();

    // Cleanup: Disconnect Stream user if component unmounts (e.g., app closes fully)
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
      // If app is ready, user is logged in, and Stream is not yet connected/loading, connect it
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

  // Handle Stream connection errors
  useEffect(() => {
    if (streamError) {
      Alert.alert("Stream Error", streamError);
      // Optionally, you might want to log out or redirect on persistent Stream errors
      // dispatch(authLogout());
    }
  }, [streamError, dispatch]); // Added dispatch to dependency array for useEffect safety

  // Show a global loading screen while authenticating or connecting to Stream
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

  // Get the StreamVideoClient instance from the global getter function
  const videoClient = getGlobalStreamVideoClient();

  // If user is authenticated AND Stream Video client is successfully connected,
  // render the main application (tabs, call screens) wrapped in StreamVideo Provider.
  if (user && appAuthToken && streamConnected && videoClient) {
    return (
      // StreamVideo Provider must wrap all screens that use Stream Video functionalities
      <StreamVideo client={videoClient}>
        <Stack>
          {/* This is the main authenticated part of your app, usually a Tab Navigator */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* This is your global call screen, shown as a modal over other content */}
          <Stack.Screen
            name="calls/[streamCallId]"
            options={{ headerShown: false, presentation: "fullScreenModal" }}
          />
          {/* Catch-all for undefined routes within the authenticated flow */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </StreamVideo>
    );
  }

  // If user is NOT authenticated, redirect them to the authentication flow
  // (e.g., login, register, verify, forgot password screens)
  return (
    <Stack>
      {/* This Stack is for your authentication-related screens */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      {/* Catch-all for undefined routes within the unauthenticated flow */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// This is the actual default export of your app/_layout.tsx file.
// It wraps the entire application with the Redux Provider.
export default function App() {
  return (
    <Provider store={store}>
      <AppRootLayout />
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