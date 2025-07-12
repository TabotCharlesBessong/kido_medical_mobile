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


import { Tabs, Redirect } from "expo-router";
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
        if (authUser.role === "PATIENT" && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap(); // assuming patientId is userId
        } else if (authUser.role === "DOCTOR" && authUser.doctorProfileId) {
          await dispatch(
            fetchDoctorProfileById(authUser.doctorProfileId)
          ).unwrap();
        } else if (
          authUser.role === "PENDING_DOCTOR" &&
          authUser.doctorProfileId
        ) {
          // Also fetch for PENDING_DOCTOR to show status on profile page
          await dispatch(
            fetchDoctorProfileById(authUser.doctorProfileId)
          ).unwrap();
        }
        setHasCheckedProfiles(true);
      } else if (!authUser && !authIsLoading) {
        setHasCheckedProfiles(true); // No authenticated user, ready to redirect to login
      }
    };

    if (!hasCheckedProfiles && !authIsLoading && authUser) {
      checkAndFetchProfiles();
    }
  }, [authUser, authIsLoading, hasCheckedProfiles, dispatch]);

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

  // --- Redirect to Profile Completion if needed ---
  if (authUser) {
    const hasPatientProfile = !!patientProfile;
    const hasDoctorProfile = !!doctorProfile;

    if (authUser.role === "PATIENT" && !hasPatientProfile) {
      // @ts-ignore
      return <Redirect href="/profile/create-patient" />;
    }
    if (
      (authUser.role === "DOCTOR" || authUser.role === "PENDING_DOCTOR") &&
      !hasDoctorProfile
    ) {
      return <Redirect href="/profile/create-doctor" />;
    }

    // After ensuring profiles are complete, determine role-based tab visibility
    const isAdmin = authUser?.role === "ADMIN";
    const isDoctor = authUser?.role === "DOCTOR";
    const isPatient = authUser?.role === "PATIENT"; // And ensure patient profile is complete
    const isPendingDoctor = authUser?.role === "PENDING_DOCTOR";

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

        {/* Doctor-specific tabs (only for APPROVED doctors) */}
        {isDoctor && (
          <>
            <Tabs.Screen
              name="doctor/create-timeslot"
              options={{
                title: "Timeslots",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="clock-o" color={color} />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="doctor/my-appointments"
              options={{
                title: "Doc Apps",
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
              name="doctor/my-consultations"
              options={{
                title: "My Consults",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="file-text-o" color={color} />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="doctor/my-prescriptions" // Assuming a screen for doctors to view their issued prescriptions
              options={{
                title: "My Presc.",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="stethoscope" color={color} />
                ), // Example icon
                headerShown: false,
              }}
            />
          </>
        )}

        {/* Patient-specific tabs (only for patients with completed profile) */}
        {isPatient && (
          <>
            <Tabs.Screen
              name="book-appointment/doctor-list" // Entry point for booking
              options={{
                title: "Book Appt",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="calendar-plus-o" color={color} />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-appointments"
              options={{
                title: "My Apps",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="calendar" color={color} />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-records/consultations"
              options={{
                title: "My Consults",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="history" color={color} />
                ),
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-records/prescriptions"
              options={{
                title: "My Presc.",
                tabBarIcon: ({ color }) => (
                  <FontAwesome size={28} name="medkit" color={color} />
                ),
                headerShown: false,
              }}
            />
          </>
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

        {/* Profile tab, always visible after initial completion */}
        <Tabs.Screen
          name="profile/my-profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user" color={color} />
            ),
            headerShown: false,
          }}
        />

        {/* HIDDEN SCREENS (accessed via router.push) */}
        {/* Profile Completion/Edit */}
        <Tabs.Screen
          name="profile/create-patient"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="profile/create-doctor"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="profile/edit-patient"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="profile/edit-doctor"
          options={{ href: null, headerShown: false }}
        />

        {/* Doctor Specific Details */}
        <Tabs.Screen
          name="doctor/record-consultation"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="doctor/consultation-detail"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="doctor/create-prescription"
          options={{ href: null, headerShown: false }}
        />
        {/* You might also want a detail screen for doctor's own issued prescriptions */}
        <Tabs.Screen
          name="doctor/prescription-detail"
          options={{ href: null, headerShown: false }}
        />

        {/* Patient Specific Details */}
        <Tabs.Screen
          name="book-appointment/doctor-detail"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="my-records/consultation-detail-view"
          options={{ href: null, headerShown: false }}
        />
        {/* You might also want a detail screen for patient's own prescriptions */}
        <Tabs.Screen
          name="my-records/prescription-detail-view"
          options={{ href: null, headerShown: false }}
        />
      </Tabs>
    );
  }

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