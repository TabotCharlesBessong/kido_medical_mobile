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
import { store, AppDispatch, RootState } from "@/redux/store"; // Import your Redux store
import { loadUserFromStorage } from "@/redux/slice/authSlice"; // Import the thunk to load user data
import { useDispatch, useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native"; // For loading indicator

// Create a component that wraps your navigation logic
// This allows us to use Redux hooks for conditional rendering
function RootNavigator() {
  const dispatch: AppDispatch = useDispatch();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  const [isAppReady, setIsAppReady] = React.useState(false);

  useEffect(() => {
    // Load user token and data from SecureStore when the app starts
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
  }, [dispatch]);

  // If the app is still loading user data from storage, show a splash/loading screen
  if (!isAppReady || isLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading app...</Text>
      </View>
    );
  }

  return (
    <Stack>
      {token ? (
        // User is logged in, show the main application tabs
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      ) : (
        // User is not logged in, show authentication screens
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
      {/* Fallback for any unmatched routes */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Main App component wrapping with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
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
