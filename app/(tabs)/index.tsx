import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Notificationcard } from "@/components";
import { StatusBar } from "expo-status-bar";

const index = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("register")}>
        <Notificationcard
          image="../../assets/images/doctor.jpeg"
          title="Upcoming appointment with Dr Smith"
          subject="You want to talk about your gastritis situation"
          time="11:15 AM"
        />
        <Notificationcard
          image="../../assets/images/doctor.jpeg"
          title="Upcoming appointment with Dr Smith"
          subject="You want to talk about your gastritis situation"
          time="10:30 AM"
        />
        <Notificationcard
          image="../../assets/images/doctor.jpeg"
          title="Visiting the lab technician today"
          subject="You want to talk about your gastritis situation"
          time="2:45 PM"
        />
        <Notificationcard
          image="../../assets/images/doctor.jpeg"
          title="Upcoming appointment with Dr Smith"
          subject="You want to talk about your gastritis situation"
          time="11:15 AM"
        />
        <Text>Home Alone</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    flex: 1,
    // width:"100%"
  },
});
