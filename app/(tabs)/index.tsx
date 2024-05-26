import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Notificationcard } from "@/components";

const index = () => {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("register")} >
      <Notificationcard />
      <Text>Home Alone</Text>
      </TouchableOpacity>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
