import {
  AppSelect,
  AuthInputField,
  AuthSelectField,
  PasswordVisibilityIcon,
  SubmitButton,
} from "@/components";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const register = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  return (
    <View style={styles.container}>
      <Text>register</Text>
      <AuthInputField
        name="name"
        placeholder="Charles Tabot"
        label="Name"
        containerStyle={{ marginBottom: 16 }}
      />
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
      {/* <AppSelect /> */}
      <AuthSelectField
        name="role"
        label="Select User Role"
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
        containerStyle={{ marginBottom: 16 }}
      />
      <SubmitButton title="Register now" />
    </View>
  );
};

export default register;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
