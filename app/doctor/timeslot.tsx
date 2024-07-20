import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { COLORS } from '@/constants/theme'
import { CustomText, TimeslotModal } from '@/components'
import { TimeSlot, generateRandomTimeSlots } from '@/constants/data/timeslot'
import { useRouter } from 'expo-router'
import { AppDispatch } from '@/redux/store'
import { useDispatch } from 'react-redux'

const TimeSlotScreen: React.FC = () => {
  const { t } = useTranslation()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateRandomTimeSlots(8))
  const [isModalVisible, setIsModalVisible] = useState(false)
  const dispatch: AppDispatch = useDispatch()
  const router = useRouter()

  const handleCreateTimeSlot = (startTime: string, endTime: string, isWeekly: boolean) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isAvailable: true,
      isWeekly,
    }
    setTimeSlots(prevSlots => [...prevSlots, newSlot])
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CustomText type='h3'>{t('timeslot.manageTimeSlots')}</CustomText>
        {timeSlots.map(slot => (
          <View key={slot.id} style={styles.timeSlotItem}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <CustomText type='body3'>
                {slot.isAvailable ? t('timeslot.available') : t('timeslot.notAvailable')}
              </CustomText>
              <CustomText type='body1'>{`${slot.startTime} - ${slot.endTime}`}</CustomText>
            </View>
            {slot.isWeekly && <CustomText type='body2'>{t('timeslot.weekly')}</CustomText>}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <CustomText type='body1'>{t('timeslot.addTimeSlot')}</CustomText>
        </TouchableOpacity>
      </ScrollView>
      <TimeslotModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        onCreate={handleCreateTimeSlot}
      />
    </SafeAreaView>
  )
}

export default TimeSlotScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 20,
  },
  timeSlotItem: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginVertical: 5,
  },
  available: {
    color: COLORS.primary,
  },
  notAvailable: {
    color: COLORS.danger,
  },
  weekly: {
    color: 'blue',
  },
  addButton: {
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
})
