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


import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; // Example icon library
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" // This maps to app/(tabs)/index.tsx for your home screen
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerShown: false, // Hide header if you prefer custom header or no header
        }}
      />
      {/* Add other main app tabs here */}
      {/* Example: */}
      {/* <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
