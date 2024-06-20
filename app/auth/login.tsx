import {
  AppSelect,
  AuthCheckbox,
  AuthInputField,
  AuthRadioButton,
  AuthSelectField,
  CustomText,
  PasswordVisibilityIcon,
  SubmitButton,
} from "@/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const login = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string>("");
  const handleRadioButtonChange = (label: string) => {
    setActiveButton(label);
  };
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomText type="larger">Welcome back</CustomText>
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
      <TouchableOpacity
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          marginVertical: 6,
        }}
        onPress={() => router.push("auth/forgot")}
      >
        <CustomText type="body5">forgot password?</CustomText>
      </TouchableOpacity>
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
