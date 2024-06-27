The error `cannot read property "handleChange" of undefined` is likely due to the fact that `useFormikContext` is not correctly providing the context. This can happen if `AuthInputField` is used outside of a Formik context or if Formik is not properly set up.

Here’s how you can fix this:

1. Ensure that `AuthInputField` is wrapped in a Formik component.
2. Make sure that `useFormikContext` is correctly utilized in `AuthInputField`.

I will update the `AuthInputField` and `register` components to ensure that Formik is correctly set up.

### Updated `AuthInputField` Component

```tsx
// AuthInputField.tsx
import { useFormikContext } from "formik";
import React, { FC, ReactNode, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Pressable,
} from "react-native";
import { COLORS } from "@/constants/theme";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightIcon?: ReactNode;
  onRightIconPress?(): void;
}

const AuthInputField: FC<Props> = (props) => {
  const { handleChange, handleBlur, values, errors, touched } = useFormikContext<{
    [key: string]: string;
  }>();

  const {
    label,
    placeholder,
    autoCapitalize,
    keyboardType,
    secureTextEntry,
    containerStyle,
    name,
    rightIcon,
    onRightIconPress,
  } = props;

  const errorMsg = touched[name] && errors[name] ? errors[name] : "";

  return (
    <View style={[containerStyle, { width: "100%" }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
      </View>
      <View>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onChangeText={handleChange(name)}
          value={values[name]}
          onBlur={handleBlur(name)}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  label: {
    color: COLORS.primary,
  },
  errorMsg: {
    color: COLORS.danger,
  },
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  rightIcon: {
    width: 45,
    height: 45,
    position: "absolute",
    top: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthInputField;
```

### Updated `register` Component

```tsx
// register.tsx
import {
  AppButton,
  AuthInputField,
  PasswordVisibilityIcon,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

interface SignupValues {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const initialValues: SignupValues = {
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

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

  const handleSubmit = async (
    values: SignupValues,
    actions: FormikHelpers<SignupValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("http://192.168.1.199:5001/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (!data.success) return setErrorMessage(data.message);
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
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formContainer}>
            <AuthInputField
              name="firstname"
              placeholder="Charles Bessong"
              label="First Name"
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="lastname"
              placeholder="Tabot"
              label="Last Name"
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
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  formContainer: {
    width: "90%",
  },
});
```

### Explanation

1. **AuthInputField.tsx**:
   - Correctly uses `useFormikContext` to get Formik's context.
   - Handles `onChangeText`, `onBlur`, `value`, and error messages properly.

2. **register.tsx**:
   - Uses Formik to manage form state and validation.
   - Passes the necessary props to `AuthInputField`.
   - Handles form submission with `handleSubmit`.

This should resolve the issue and ensure proper form handling with Formik and Yup.