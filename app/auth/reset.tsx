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
      <CustomText type="larger">Create your new password</CustomText>
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
      <AuthInputField
        name="cpassword"
        placeholder="*************"
        label="Confirm Password"
        containerStyle={{ marginBottom: 16 }}
        secureTextEntry={!secureTextEntry}
        rightIcon={<PasswordVisibilityIcon privateIcon={secureTextEntry} />}
        onRightIconPress={() => {
          setSecureTextEntry(!secureTextEntry);
        }}
      />
      <SubmitButton onPress={() => router.push("(tabs)")} title="Create New Password" />
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
