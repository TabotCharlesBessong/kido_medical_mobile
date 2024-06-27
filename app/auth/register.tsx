import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon
} from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

interface SignupValues {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword: string
}

const register = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const dispatch = useDispatch()
  const initialValues: SignupValues = {
    lastname:'',
    firstname:'',
    email:'',
    password:'',
    confirmPassword:''
  }

  const signupSchema = yup.object({
    firstname: yup
      .string()
      .trim("First Name is missing!")
      .min(3, "Invalid name!")
      .required("First Name is required!"),
    lastname: yup
      .string()
      .trim("Last Name is missing!")
      .min(3, "Invalid name!")
      .required("Last Name is required!"),
    email: yup
      .string()
      .trim("Email is missing!")
      .email("Invalid email!")
      .required("Email is required!"),
    password: yup
      .string()
      .trim("Password is missing!")
      .min(8, "Password is too short!")
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        "Password is too simple!"
      )
      .required("Password is required!"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required!"),
  });

  // const handleSubmit = (values:SignupValues) => {
  //   dispatch(register(values))
  // }

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    console.log(values)
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("http:192.168.1.199:5001/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      console.log(res)
      const data = await res.json();
      console.log(data)
      if (data.success === false) return setErrorMessage(data.message);
      setLoading(false);
      if (res.ok) router.push("auth/login");
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="larger">Create account</CustomText>
      {/* <Form> */}
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleSubmit,
        }) => (

          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="firstname"
              placeholder="Charles Bessong"
              label="First Name"
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="lastname"
              placeholder="Tabot"
              label="First Name"
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
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <AuthInputField
              name="confirmPassword"
              placeholder="*************"
              label="Confirm Password"
              containerStyle={{ marginBottom: 16 }}
              secureTextEntry={!secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title="Register now"
              loading={loading}
              loadingText="Registering...."
            />
            <View style={styles.bottomLinks} >
              <CustomText type="body5" >do you already have an account?</CustomText>
              <AppLink title="login" onPress={() => router.push("auth/login")} />
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
      {/* </Form> */}
    </KeyboardAvoidingView>
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
  bottomLinks:{
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between",
    marginVertical:16,
    flexDirection:"row",
    width:"90%"
  }
});
