import React, { useState } from "react";
import {
  Modal,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@/constants/theme";
import { AppButton, AuthCheckbox, CustomText } from "@/components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { createTimeSlot } from "@/redux/actions/timeslot.action";


interface TimeSlotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (startTime: string, endTime: string, isWeekly: boolean) => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isVisible,
  onClose,
  onCreate,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isWeekly, setIsWeekly] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const dispatch: AppDispatch = useDispatch();

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
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (startTime && endTime) {
      const doctorId = 1; // Replace with actual doctor ID
      const newTimeSlot = {
        doctorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: true,
      };

      try {
        await dispatch(createTimeSlot(newTimeSlot));
        onCreate(formatTime(startTime), formatTime(endTime), isWeekly);
        onClose();
      } catch (error) {
        Alert.alert("Error", "Failed to create time slot. Please try again.");
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please select both start and end times."
      );
    }
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

          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.timePickerButton}
          >
            <CustomText type="body1">
              {startTime ? formatTime(startTime) : "Select Start Time"}
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

          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.timePickerButton}
          >
            <CustomText type="body1">
              {endTime ? formatTime(endTime) : "Select End Time"}
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
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              marginTop: 12,
            }}
          >
            <AppButton
              title="Create"
              onPress={() => {
                if (startTime && endTime) {
                  onCreate(
                    formatTime(startTime),
                    formatTime(endTime),
                    isWeekly
                  );
                  onClose();
                }
              }}
              // onPress={handleCreate}
              width={120}
              backgroundColor={COLORS.primary}
            />
            <AppButton
              title="Cancel"
              onPress={onClose}
              width={120}
              backgroundColor={COLORS.danger}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    // alignItems: "center",
  },
  timePickerButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 5,
  },
});

export default TimeSlotModal;
