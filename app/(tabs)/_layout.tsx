import Colors from "@/constants/Colors";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

const TabBarIcons = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) => {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
};

const TabLayout = () => {
  const colorScheme = useColorScheme()

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcons name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="doctor"
        options={{
          title: "Doctor",
          tabBarIcon: ({ color }) => <TabBarIcons name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="patient"
        options={{
          title: "Patient",
          tabBarIcon: ({ color }) => <TabBarIcons name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color }) => <AntDesign name="setting" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}

export default TabLayout