To update the reset password functionality to check if the code matches the code received from the forgot password response before changing the password, you can follow these steps:

1. **Store the code received from the forgot password response.**
2. **Compare the stored code with the entered code in the reset password form.**
3. **Proceed with the password reset if the codes match.**

Here's how you can implement this:

### Step 1: Store the Code
- Modify the forgot password logic to store the received code.

### Step 2: Compare Codes and Reset Password

Here's the updated code for both `forgotpassword.tsx` and `reset.tsx`:

#### `forgotpassword.tsx`

```typescript
import { AppButton, AuthInputField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ForgotValues {
  email: string;
}

const forgot = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const initialValues: ForgotValues = {
    email: "",
  };

  const signupSchema = yup.object({
    email: yup
      .string()
      .trim("Email is missing!")
      .email("Invalid email!")
      .required("Email is required!"),
  });

  const handleSubmit = async (
    values: ForgotValues,
    actions: FormikHelpers<ForgotValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch(
        "http:192.168.1.199:5001/api/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (data.success === false) return setErrorMessage(data.message);

      // Store the code in AsyncStorage
      await AsyncStorage.setItem("resetCode", data.data.token.code);

      setLoading(false);
      if (res.ok) router.push("auth/reset");
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="h2">
        You forgot your password, no problem you can reset it
      </CustomText>
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
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title="Forgot Password"
              loading={loading}
              loadingText="Sending reset...."
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default forgot;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
```

#### `reset.tsx`

```typescript
import {
  AppButton,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ResetValues {
  password: string;
  confirmPassword: string;
  code: string;
}

const reset = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues: ResetValues = {
    password: "",
    confirmPassword: "",
    code: "",
  };

  const resetSchema = yup.object({
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
    code: yup.string().required("Code is required"),
  });

  const handleSubmit = async (
    values: ResetValues,
    actions: FormikHelpers<ResetValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Retrieve the code from AsyncStorage
      const storedCode = await AsyncStorage.getItem("resetCode");

      if (storedCode !== values.code) {
        setErrorMessage("The code you entered is incorrect.");
        setLoading(false);
        return;
      }

      const res = await fetch("http:192.168.1.199:5001/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
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
      <CustomText type="larger">Create your new password</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="code"
              placeholder="XX4GBN"
              label="Enter the code sent to your mail"
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
              title="Reset Password"
              loading={loading}
              loadingText="Resetting...."
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default reset;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
```

In this code:
- The code received from the forgot password API response is stored using `AsyncStorage`.
- In the reset password screen, this code is retrieved and compared with the code entered by the user.
- If the codes match, the password reset proceeds; otherwise, an error message is displayed.