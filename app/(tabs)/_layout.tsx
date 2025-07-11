// import React from 'react';
// import Colors from "@/constants/Colors";
// import {
//   AntDesign,
//   Entypo,
//   FontAwesome,
//   FontAwesome5,
//   MaterialIcons,
// } from "@expo/vector-icons";
// import { Tabs } from "expo-router";
// import { useTranslation } from "react-i18next";
// import { useColorScheme } from "react-native";

// const TabBarIcons = (props: {
//   name: React.ComponentProps<typeof FontAwesome>["name"];
//   color: string;
// }) => {
//   return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
// };

// const TabLayout = () => {
//   const colorScheme = useColorScheme();
//   const { t } = useTranslation();

//   return (
//     <Tabs>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: t("layout.one"), // "Home"
//           tabBarIcon: ({ color }) => <TabBarIcons name="home" color={color} />,
//           headerShown: false,
//         }}
//       />
//       <Tabs.Screen
//         name="appointments"
//         options={{
//           title: "Appointments",
//           tabBarIcon: ({ color }) => (
//             <FontAwesome5 name="calendar-check" size={28} color={color} />
//           ),
//           headerShown: false,
//         }}
//       />
//       <Tabs.Screen
//         name="prescriptions"
//         options={{
//           title: "Prescriptions",
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="medication" size={28} color={color} />
//           ),
//           headerShown: false,
//         }}
//       />
//       <Tabs.Screen
//         name="education"
//         options={{
//           title: "Education",
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="school" size={28} color={color} />
//           ),
//           headerShown: false,
//         }}
//       />
//       <Tabs.Screen
//         name="chat"
//         options={{
//           title: t("layout.tow"), // "Chats"
//           tabBarIcon: ({ color }) => (
//             <Entypo name="message" color={color} size={28} />
//           ),
//           headerShown: false,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: t("layout.five"), // "Profile"
//           tabBarIcon: ({ color }) => (
//             <AntDesign name="user" color={color} size={28} />
//           ),
//           headerShown: false,
//         }}
//       />
//     </Tabs>
//   );
// };

// export default TabLayout;


import { Tabs, Redirect } from "expo-router"; // Import Redirect
import { FontAwesome } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import React, { useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { fetchPatientProfile } from "@/redux/slice/patientProfileSlice";
import { fetchDoctorProfileById } from "@/redux/slice/doctorProfileSlice";
import { COLORS } from "@/utils/constants";

export default function TabLayout() {
  const dispatch: AppDispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authIsLoading = useSelector((state: RootState) => state.auth.isLoading);
  const patientProfile = useSelector(
    (state: RootState) => state.patientProfile.profile
  );
  const patientIsLoading = useSelector(
    (state: RootState) => state.patientProfile.isLoading
  );
  const doctorProfile = useSelector(
    (state: RootState) => state.doctorProfile.profile
  );
  const doctorIsLoading = useSelector(
    (state: RootState) => state.doctorProfile.isLoading
  );

  const [hasCheckedProfiles, setHasCheckedProfiles] = React.useState(false);

  useEffect(() => {
    const checkAndFetchProfiles = async () => {
      if (authUser && !authIsLoading) {
        // If user is a PATIENT and has a patientProfileId, try to fetch it
        if (authUser.role === "PATIENT" && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap(); // assuming patientId is userId
        }
        // If user is a DOCTOR and has a doctorProfileId, try to fetch it
        else if (authUser.role === "DOCTOR" && authUser.doctorProfileId) {
          await dispatch(
            fetchDoctorProfileById(authUser.doctorProfileId)
          ).unwrap();
        }
        setHasCheckedProfiles(true);
      } else if (!authUser && !authIsLoading) {
        // No authenticated user, so no profiles to check. Mark as checked to allow redirect to login.
        setHasCheckedProfiles(true);
      }
    };

    if (!hasCheckedProfiles && !authIsLoading && authUser) {
      // Only run if not already checked and authUser is loaded
      checkAndFetchProfiles();
    }
  }, [authUser, authIsLoading, hasCheckedProfiles, dispatch]);

  // If user data is still loading or initial profile checks are pending, show a loader
  if (
    authIsLoading ||
    !hasCheckedProfiles ||
    patientIsLoading ||
    doctorIsLoading
  ) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  // Determine redirection based on user role and profile completion
  if (authUser) {
    // Check if user has a basic profile (patient or doctor)
    const hasPatientProfile = !!patientProfile;
    const hasDoctorProfile = !!doctorProfile;

    // --- Redirection Logic ---
    // If user is logged in, but their main role's profile is not complete
    if (authUser.role === "PATIENT" && !hasPatientProfile) {
      return <Redirect href="/(tabs)/profile/create-doctor" />;
    }
    // If user is a DOCTOR but their doctor profile is missing
    // Note: A user's role transitions from initial (e.g., PATIENT) -> PENDING_DOCTOR (after submission) -> DOCTOR (after admin approval)
    // Here we handle the case where they are already DOCTOR but somehow profile data is missing in client state
    if (authUser.role === "DOCTOR" && !hasDoctorProfile) {
      return <Redirect href="/profile/create-doctor" />; // Should not happen often if backend is consistent
    }

    // No redirection needed, proceed with normal tabs
    const isAdmin = authUser?.role === "ADMIN";
    const isDoctor = authUser?.role === "DOCTOR";
    const isPatient = authUser?.role === "PATIENT"; // Consider 'PENDING_DOCTOR' as well if you have it

    return (
      <Tabs>
        <Tabs.Screen
          name="index" // Home/Feed screen
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="comments" color={color} />
            ),
            headerShown: false,
          }}
        />

        {/* Doctor-specific tabs */}
        {isDoctor && (
          <>
            <Tabs.Screen
              name="doctor/my-appointments"
              options={{
                title: "My Schedule",
                tabBarIcon: ({ color }) => (
                  <FontAwesome
                    size={28}
                    name="calendar-check-o"
                    color={color}
                  />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="doctor/my-patients"
              options={{
                title: "My Patients",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="group" color={color} />
                ),
                headerShown: false,
              }}
            />
          </>
        )}

        {/* Patient-specific tabs (if needed, e.g., for booking) */}
        {isPatient && (
          <Tabs.Screen
            name="book-appointment"
            options={{
              title: "Book",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="calendar-plus-o" color={color} />
              ),
              headerShown: false,
            }}
          />
        )}

        {/* Admin-specific tab */}
        {isAdmin && (
          <Tabs.Screen
            name="admin/kyc-list"
            options={{
              title: "Admin KYC",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="gavel" color={color} />
              ),
              headerShown: false,
            }}
          />
        )}

        <Tabs.Screen
          name="profile/my-profile" // Corrected path to my-profile
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user" color={color} />
            ),
            headerShown: false,
          }}
        />
        {/*
          Hidden Screens: These screens are part of the navigation stack but not directly
          accessible via tabs. They are typically pushed via router.push()
        */}
        <Tabs.Screen name="profile/create-patient" options={{ href: null }} />
        <Tabs.Screen name="profile/create-doctor" options={{ href: null }} />
        {/* Add edit screens here too if they are separate */}
        <Tabs.Screen name="profile/edit-patient" options={{ href: null }} />
        <Tabs.Screen name="profile/edit-doctor" options={{ href: null }} />
      </Tabs>
    );
  }

  // If no authUser, redirect to login
  return <Redirect href="/auth/login" />;
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background || "#F7F7F7",
  },
});
