import React, { useState } from 'react'
import { View, StyleSheet, Text, Pressable, KeyboardAvoidingView } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AppButton, AuthInputField, AuthSelectField, CustomText } from '@/components'
import { COLORS } from '@/constants/theme'
import { useDispatch } from 'react-redux'
import { useRouter } from 'expo-router'
import * as yup from 'yup'
import { Formik, FormikHelpers } from 'formik'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { baseUrl } from '@/utils/variables'
import { useTranslation } from 'react-i18next'

interface BookingValues {
  date: string
  time: string
  reason: string
  doctorId: string
}

const BookAppointmentScreen: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [appointmentReason, setAppointmentReason] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const doctors = [
    { label: 'Doctor 1', value: 'doctor1' },
    { label: 'Doctor 2', value: 'doctor2' },
    { label: 'Doctor 3', value: 'doctor3' },
  ]

  const timeSlots = [
    { label: '9:00 AM', value: '9:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
  ]

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date()
    setShowDatePicker(false)
    setSelectedDate(currentDate)
  }

  const initialValues: BookingValues = {
    date: '',
    time: '',
    reason: '',
    doctorId: 'd0931c91-ed35-4604-b768-3d46cf720ce7',
  }

  const validationSchema = yup.object().shape({
    time: yup.string().required(t('bookAppointment.validation.timeRequired')),
    date: yup.date().required(t('bookAppointment.validation.dateRequired')).nullable(),
    reason: yup.string().required(t('bookAppointment.validation.reasonRequired')),
  })

  const handleSubmit = async (values: BookingValues, actions: FormikHelpers<BookingValues>) => {
    console.log(values)
    try {
      setLoading(true)
      setErrorMessage('')

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem('userToken')
      console.log(token)

      // Create an instance of axios with default headers
      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      // Add request interceptor to handle authorization
      instance.interceptors.request.use(
        async config => {
          // Refresh the bearer token if expired or not available
          const newToken = await AsyncStorage.getItem('userToken')
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`
          }
          return config
        },
        error => {
          return Promise.reject(error)
        },
      )

      // Add response interceptor to handle errors
      instance.interceptors.response.use(
        response => {
          return response
        },
        error => {
          if (error.response) {
            // Handle HTTP errors
            console.log(error.response.data)
            setErrorMessage(error.response.data.message)
          } else {
            // Handle network errors
            console.log(error.message)
            setErrorMessage(error.message)
          }
          return Promise.reject(error)
        },
      )

      // Make the API request
      const res = await instance.post('/patient/create', values)
      console.log(res)
      const data = res.data
      console.log(data)

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message)
      } else {
        setLoading(false)
        if (res.status === 200) {
          router.push('(tabs)')
        }
      }
    } catch (error) {
      console.log(error)
      setErrorMessage((error as TypeError).message)
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <CustomText type='h1'>{t('bookAppointment.title')}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <View style={{ width: '100%' }}>
              <AuthInputField
                label={t('bookAppointment.appointmentReasonLabel')}
                name='reason'
                placeholder={t('bookAppointment.appointmentReasonPlaceholder')}
                containerStyle={styles.fieldContainer}
              />
            </View>
            <View
              style={[
                styles.fieldContainer,
                {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 24,
                },
              ]}
            >
              <Text style={styles.label}>{t('bookAppointment.selectDateLabel')}</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <Text style={styles.datePickerButtonText}>{selectedDate.toDateString()}</Text>
              </Pressable>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode='date'
                display='default'
                onChange={handleDateChange}
              />
            )}
            <View style={{ width: '100%' }}>
              <AuthSelectField
                label={t('bookAppointment.selectTimeLabel')}
                name='time'
                options={timeSlots}
                containerStyle={styles.fieldContainer}
                placeholder={t('bookAppointment.selectTimePlaceholder')}
              />
            </View>
            <AppButton
              title={t('bookAppointment.bookButton')}
              width={'100%'}
              backgroundColor={COLORS.primary}
              onPress={handleSubmit}
              loading={loading}
              loadingText={t('bookAppointment.loadingText')}
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    padding: 16,
  },
  fieldContainer: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    left: -24,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 5,
    right: -24,
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
})

export default BookAppointmentScreen
