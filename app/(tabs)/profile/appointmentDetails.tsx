import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { AppButton, CustomText } from '@/components'
import { COLORS } from '@/constants/theme'

const AppointmentDetailsScreen: React.FC = () => {
  const router = useRouter()
  const { appointment } = useLocalSearchParams()
  const appointmentData = JSON.parse(appointment)

  const handleChat = () => {
    router.push(`/chat/conversation`)
  }

  const handleCall = () => {
    router.push(`/call/${appointmentData.id}`)
  }

  const handlePrescribe = () => {
    router.push(`/prescribe/${appointmentData.id}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type='h1'>Appointment Details</CustomText>
      </View>
      <View style={styles.detailsContainer}>
        <CustomText type='body3'>Doctor: {appointmentData.doctorName}</CustomText>
        <CustomText type='body4'>Specialty: {appointmentData.doctorSpecialty}</CustomText>
        <CustomText type='body4'>Date: {appointmentData.date}</CustomText>
        <CustomText type='body4'>Time: {appointmentData.time}</CustomText>
        <CustomText type='body4'>Reason: {appointmentData.reason}</CustomText>
        <CustomText type='body4'>Status: {appointmentData.appointmentStatus}</CustomText>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton containerStyle={{ marginTop: 24 }} title='Chat' onPress={handleChat} />
        <AppButton containerStyle={{ marginTop: 24 }} title='Call' onPress={handleCall} />
        <AppButton containerStyle={{ marginTop: 24 }} title='Prescribe' onPress={handlePrescribe} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    // flexDirection: "row",
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 20,
    // alignItems:"space-around"
  },
})

export default AppointmentDetailsScreen
