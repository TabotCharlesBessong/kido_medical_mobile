import {
  AppButton,
  AppLink,
  AuthInputField,
  CustomText,
  PasswordVisibilityIcon,
  SubmitButton,
} from "@/components";
import { COLORS } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { loginUserThunk } from "../feature/auth/thunks/auth.thunk";
import { ApiRequestStatus } from "@/types/api.types";
import { RootState, useAppDispatch } from "@/redux/store";

interface SigninValues {
  email: string;
  password: string;
}

const auth2 = () => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
    const loginSlice = useSelector((state:RootState) => state.login);

    console.log(loginSlice, 'sasa');
    


  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const initialValues: SigninValues = {
    email: "",
    password: "",
  };

  const signupSchema = yup.object({
    email: yup
      .string()
      .trim(t("login.yup.email.trim"))
      .email(t("login.yup.email.email"))
      .required(t("login.yup.email.required")),
    password: yup
      .string()
      .trim(t("login.yup.password.trim"))
      .min(8, t("login.yup.password.min"))
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
        t("login.yup.password.matches")
      )
      .required(t("login.yup.password.required")),
  });

  // const saveUserData = async (data:any) => {
  //   try {
  //     await AsyncStorage.setItem("userToken",data.data.token)
  //     await AsyncStorage.setItem("userData",JSON.stringify(data.user))
  //   } catch (error) {
  //     console.log("Error saving data",(error as TypeError).message)
  //   }
  // }

  const handleSubmit = async (
    values: SigninValues,
    actions: FormikHelpers<SigninValues>
  ) => {
    console.log(values);
        dispatch(loginUserThunk(values));
              setLoading(true);
                    setErrorMessage("");
                    console.log(loginSlice,'jhg slice');
                    
  };


  useEffect(() => {
        if (loginSlice.status === ApiRequestStatus.FULFILLED) {
          router.push("(tabs)");
                      setLoading(false);

        }

        if (loginSlice.status === ApiRequestStatus.REJECTED) {
            console.log(loginSlice.message);
            setLoading(false);
                  setErrorMessage(loginSlice?.message);

        }

  },[loginSlice])

  return (
    <KeyboardAvoidingView style={styles.container}>
      <CustomText type="h1">{t("login.title")}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthInputField
              name="email"
              placeholder={t("login.form.placeholder1")}
              label={t("login.form.label1")}
              containerStyle={{ marginBottom: 16 }}
            />
            <AuthInputField
              name="password"
              placeholder={t("login.form.placeholder2")}
              label={t("login.form.label2")}
              containerStyle={{ marginBottom: 16 }}
              secureTextEntry={!secureTextEntry}
              rightIcon={
                <PasswordVisibilityIcon privateIcon={secureTextEntry} />
              }
              onRightIconPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            />
            <Text>{errorMessage}</Text>
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("login.forgotText")}</CustomText>
              <AppLink
                title={t("login.forgotLink")}
                onPress={() => router.push("auth/forgot")}
              />
            </View>
            <AppButton
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              title={t("login.button")}
              loading={loading}
              loadingText={t("login.loading")}
            />
            <View style={styles.bottomLinks}>
              <CustomText type="body5">{t("login.registerText")}</CustomText>
              <AppLink
                title={t("login.registerLink")}
                onPress={() => router.push("auth/register")}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default auth2;

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
