Sure, let's update the code to include the time picker in the modal and use the `AuthCheckbox` component for the availability checkbox. Additionally, we'll generate random data with time slots formatted in HH:MM format and ensure the random data function generates data of a specified size.

### 1. Time Slot Modal Component with Time Picker and Checkbox (TypeScript)

First, let's update the `TimeSlotModal` component to include the time pickers and the availability checkbox using the `AuthCheckbox` component.

```tsx
// components/TimeSlotModal.tsx
import React, { useState } from 'react';
import { Modal, View, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/components/CustomText';
import AuthCheckbox from '@/components/AuthCheckbox';
import { COLORS } from '@/constants/theme';

interface TimeSlotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (startTime: string, endTime: string, isWeekly: boolean) => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({ isVisible, onClose, onCreate }) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isWeekly, setIsWeekly] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <CustomText type="h3">Create Time Slot</CustomText>

          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timePickerButton}>
            <CustomText type="body1">
              {startTime ? formatTime(startTime) : 'Select Start Time'}
            </CustomText>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
            />
          )}

          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timePickerButton}>
            <CustomText type="body1">
              {endTime ? formatTime(endTime) : 'Select End Time'}
            </CustomText>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
            />
          )}

          <AuthCheckbox
            isChecked={isWeekly}
            onPress={() => setIsWeekly(!isWeekly)}
            title="Weekly Availability"
          />

          <Button
            title="Create"
            onPress={() => {
              if (startTime && endTime) {
                onCreate(formatTime(startTime), formatTime(endTime), isWeekly);
                onClose();
              }
            }}
          />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
  },
  timePickerButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
  },
});

export default TimeSlotModal;
```

### 2. Main Screen to Display and Create Time Slots (TypeScript)

Next, update the `ManageTimeSlotsScreen` to include the modal and handle the creation of new time slots.

```tsx
// screens/ManageTimeSlotsScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import TimeSlotModal from '@/components/TimeSlotModal';
import { generateRandomTimeSlots, TimeSlot } from '@/utils/randomData';
import { COLORS } from '@/constants/theme';

const ManageTimeSlotsScreen: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateRandomTimeSlots(5));
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreateTimeSlot = (startTime: string, endTime: string, isWeekly: boolean) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isAvailable: true,
      isWeekly,
    };
    setTimeSlots((prevSlots) => [...prevSlots, newSlot]);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CustomText type="h3" style={styles.header}>Manage Time Slots</CustomText>
        {timeSlots.map((slot) => (
          <View key={slot.id} style={styles.timeSlotItem}>
            <CustomText type="body1">
              {`${slot.startTime} - ${slot.endTime}`}
            </CustomText>
            <CustomText type="body2" style={slot.isAvailable ? styles.available : styles.notAvailable}>
              {slot.isAvailable ? 'Available' : 'Not Available'}
            </CustomText>
            {slot.isWeekly && <CustomText type="body2" style={styles.weekly}>Weekly</CustomText>}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <CustomText type="body1" style={styles.addButtonText}>+ Add Time Slot</CustomText>
        </TouchableOpacity>
      </ScrollView>
      <TimeSlotModal 
        isVisible={isModalVisible} 
        onClose={toggleModal} 
        onCreate={handleCreateTimeSlot} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 20,
  },
  timeSlotItem: {
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginVertical: 5,
  },
  available: {
    color: COLORS.green,
  },
  notAvailable: {
    color: COLORS.red,
  },
  weekly: {
    color: COLORS.blue,
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
});

export default ManageTimeSlotsScreen;
```

### 3. Utility Functions for Generating Random Data (TypeScript)

Update the utility function to generate random time slots with the specified size.

```tsx
// utils/randomData.ts
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isWeekly: boolean;
}

export const generateRandomTimeSlots = (size: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let i = 0; i < size; i++) {
    const startHour = Math.floor(Math.random() * 24);
    const startMinute = Math.floor(Math.random() * 60);
    const endHour = Math.floor(Math.random() * 24);
    const endMinute = Math.floor(Math.random() * 60);
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    slots.push({
      id: i.toString(),
      startTime,
      endTime,
      isAvailable: Math.random() > 0.5,
      isWeekly: Math.random() > 0.5,
    });
  }
  return slots;
};


```

### Summary

1. **TimeSlotModal** component includes a time picker for selecting start and end times, a checkbox for weekly availability, and a button to create a time slot.
2. **ManageTimeSlotsScreen** displays a list of existing time slots and uses the modal to create new slots.
3. **Random Data Generation** creates time slots with random start and end times, and random availability and weekly status.

This code ensures that doctors can manage their available time slots easily and efficiently.