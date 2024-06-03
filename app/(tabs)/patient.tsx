import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CustomText } from '@/components'

const patient = () => {
  return (
    <View style={styles.container}>
      <CustomText type="body4">patient</CustomText>
      <CustomText type="larger">Hello Patients</CustomText>
      <CustomText type="h1">Hello Patients</CustomText>
      <CustomText type="h2">Hello Patients</CustomText>
      <CustomText type="h3">Hello Patients</CustomText>
      <CustomText type="h4">Hello Patients</CustomText>
      <CustomText type="body1">Hello Patients</CustomText>
      <CustomText type="body2">Hello Patients</CustomText>
      <CustomText type="body3">Hello Patients</CustomText>
      <CustomText type="body4">Hello Patients</CustomText>
    </View>
  );
}

export default patient

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});