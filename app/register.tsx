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
          { label: "Doctor", value: "option1" },
          { label: "Patient", value: "option2" },
          { label: "Nurse", value: "option3" },
        ]}
        containerStyle={{ marginBottom: 16 }}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 16,
          width: "90%",
          left: 4,
        }}
      >
        <AuthCheckbox
          onPress={() => setMusic(!music)}
          title="Music"
          isChecked={music}
        />
        <AuthCheckbox
          onPress={() => setDancing(!dancing)}
          title="Dancing"
          isChecked={dancing}
        />
        <AuthCheckbox
          onPress={() => setReading(!reading)}
          title="Reading"
          isChecked={reading}
        />
      </View>
      <AuthRadioButton
        options={["Option 1", "Option 2", "Option 3"]}
        activeButton="Option 1"
        onChange={handleRadioButtonChange}
        containerOptions={{ style: { marginVertical: 16 ,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"} }}
        buttonStyle={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 8,
        }}
        labelStyle={{ marginLeft: 8 }}
        radioSize={24}
      />
      <SubmitButton onPress={() => router.push("login")} title="Register now" />
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
