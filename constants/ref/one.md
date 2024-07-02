To store the token and user information in AsyncStorage after a successful login, you can modify your `handleSubmit` function to save these details. You can also create a function to save the data in AsyncStorage and use it in your `handleSubmit` function. 

Here's the updated `login.tsx` code with these changes:

```typescript
import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import * as yup from "yup";

interface SigninValues {
  email: string;
  password: string;
}

const login = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues: SigninValues = {
    email: "",
    password: "",
  };

  const signupSchema = yup.object({
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
  });

  const saveUserData = async (data: any) => {
    try {
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));
    } catch (error) {
      console.log("Error saving data", error);
    }
  };

  const handleSubmit = async (
    values: SigninValues,
    actions: FormikHelpers<SigninValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("http:192.168.1.199:5001/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (!data.status) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      await saveUserData(data.data);
      setLoading(false);
      if (res.ok) {
        router.push("(tabs)");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="larger">Welcome back</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
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
            <View style={styles.bottomLinks}>
              <CustomText type="body5">forgot your password?</CustomText>
              <AppLink
                title="forgot password"
                onPress={() => router.push("auth/forgot")}
              />
            </View>
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title="Login"
              loading={loading}
              loadingText="Logging in...."
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">don't yet have an account?</CustomText>
              <AppLink
                title="register"
                onPress={() => router.push("auth/register")}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
      {errorMessage ? (
        <CustomText type="body4" style={{ color: "red", marginTop: 10 }}>
          {errorMessage}
        </CustomText>
      ) : null}
    </KeyboardAvoidingView>
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
  bottomLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    flexDirection: "row",
    width: "90%",
  },
});
```

### Changes Made:
1. **AsyncStorage Imports**: Imported `AsyncStorage` for storing the token and user data.
2. **saveUserData Function**: Added a helper function to save the token and user data to `AsyncStorage`.
3. **handleSubmit Function**: Called the `saveUserData` function to save the token and user data after a successful login.

Now, the token and user information will be stored in `AsyncStorage` after a successful login, allowing you to access them when needed for authorization.