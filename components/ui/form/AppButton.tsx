import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import colors from "@/constants/Colors";

interface AppButtonProps {
  title: string;
  onPress?(): void;
}

const AppButton: FC<AppButtonProps> = ({ title, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  container: {
    width: "95%",
    height: 45,
    backgroundColor: colors.SECONDARY,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  title: {
    color: "#FBFBFB",
    fontSize: 18,
  },
});
