import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/theme";
import { CustomText, TimeslotModal } from "@/components";
import { TimeSlot, generateRandomTimeSlots } from "@/constants/data/timeslot";

const TimeSlotScreen: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    generateRandomTimeSlots(8)
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreateTimeSlot = (
    startTime: string,
    endTime: string,
    isWeekly: boolean
  ) => {
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
        <CustomText type="h3">Manage Time Slots</CustomText>
        {timeSlots.map((slot) => (
          <View key={slot.id} style={styles.timeSlotItem}>
            <View style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}} >
            <CustomText
              type="body2"
              // style={slot.isAvailable ? styles.available : styles.notAvailable}
            >
              {slot.isAvailable ? "Available" : "Not Available"}
            </CustomText>
            <CustomText type="body1">
              {`${slot.startTime} - ${slot.endTime}`}
            </CustomText>

            </View>
            {slot.isWeekly && <CustomText type="body2">Weekly</CustomText>}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <CustomText type="body1">+ Add Time Slot</CustomText>
        </TouchableOpacity>
      </ScrollView>
      <TimeslotModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        onCreate={handleCreateTimeSlot}
      />
    </SafeAreaView>
  );
};

export default TimeSlotScreen

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
    backgroundColor: COLORS.gray,
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
    color: "blue",
  },
  addButton: {
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
