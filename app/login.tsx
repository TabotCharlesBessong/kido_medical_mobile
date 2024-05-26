import {
  AppSelect,
  AuthCheckbox,
  AuthInputField,
  AuthRadioButton,
  AuthSelectField,
  PasswordVisibilityIcon,
  SubmitButton,
} from "@/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const login = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [music, setMusic] = useState(false);
  const [dancing, setDancing] = useState(false);
  const [reading, setReading] = useState(false);
  const [activeButton, setActiveButton] = useState<string>("");
  const handleRadioButtonChange = (label: string) => {
    setActiveButton(label);
  };
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AuthInputField
        name="email"
        placeholder="ebezebeatrice@gmail.com"
        label="Email Address"
        containerStyle={{ marginBottom: 16 }}
      />
      <AuthInputField
        name="password"
        placeholder="*************"
        label="Password"
        containerStyle={{ marginBottom: 16 }}
        secureTextEntry={!secureTextEntry}
        rightIcon={<PasswordVisibilityIcon privateIcon={secureTextEntry} />}
        onRightIconPress={() => {
          setSecureTextEntry(!secureTextEntry);
        }}
      />
      <SubmitButton onPress={() => router.push("(tabs)")} title="Login now" />
    </View>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
