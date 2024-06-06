import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AuthInputField, CustomText, SubmitButton } from '@/components';
import { useRouter } from 'expo-router';

const forgot = () => {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <CustomText type="larger">Welcome back</CustomText>
      <CustomText type="h2">
        You forgot your password, no problem you can reset it
      </CustomText>
      <AuthInputField
        name="email"
        placeholder="ebezebeatrice@gmail.com"
        label="Email Address"
        containerStyle={{ marginBottom: 16 }}
      />
      <SubmitButton onPress={() => router.push("auth/reset")} title="Reset Link" />
    </View>
  );
}

export default forgot

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});