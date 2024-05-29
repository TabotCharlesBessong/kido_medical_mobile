import { Notificationcard, PharmacieCard } from "@/components";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const index = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.push("register")}>
        <Text>Home Alone</Text>
      </TouchableOpacity>
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
      <View>
        <PharmacieCard />
        <PharmacieCard />
        <PharmacieCard />
        <PharmacieCard />

      </View>
      <StatusBar style="auto" />
    </ScrollView>
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
