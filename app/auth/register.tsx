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
import { StyleSheet, Text, View } from "react-native";

const register = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [music, setMusic] = useState(false);
  const [dancing, setDancing] = useState(false);
  const [reading, setReading] = useState(false); 
  const [activeButton, setActiveButton] = useState<string>("")
  const handleRadioButtonChange = (label:string) => {
    setActiveButton(label)
  }
  const router = useRouter()
  
  return (
    <View style={styles.container}>
      <CustomText type="larger" >Create account</CustomText>
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
      
      <SubmitButton onPress={() => router.push("auth/login")} title="Register now" />
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
