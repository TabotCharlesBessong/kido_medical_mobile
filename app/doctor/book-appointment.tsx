import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppButton, AuthInputField, AuthSelectField, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";

const BookAppointmentScreen: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const doctors = [
    { label: "Doctor 1", value: "doctor1" },
    { label: "Doctor 2", value: "doctor2" },
    { label: "Doctor 3", value: "doctor3" },
  ];

  const timeSlots = [
    { label: "9:00 AM", value: "9:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
  ];

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const handleAppointmentSubmit = () => {
    // Handle appointment submission logic
  };

  return (
    <View style={styles.container}>
      <CustomText type="h1" >Book appointment with your doctor</CustomText>
      <AuthSelectField
        label="Choose Doctor"
        name="doctor"
        options={doctors}
        containerStyle={styles.fieldContainer}
        placeholder="Select a doctor"
        // value={selectedDoctor}
        // onValueChange={(value) => setSelectedDoctor(value)}
      />
      <AuthInputField
        label="Appointment Reason"
        name="reason"
        placeholder="Enter appointment reason"
        containerStyle={styles.fieldContainer}
        // value={appointmentReason}
        // onChangeText={(text) => setAppointmentReason(text)}
      />
      <View
        style={[
          styles.fieldContainer,
          {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <Text style={styles.label}>Select Date:</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerButtonText}>
            {selectedDate.toDateString()}
          </Text>
        </Pressable>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <AuthSelectField
        label="Choose Time Slot"
        name="time"
        options={timeSlots}
        containerStyle={styles.fieldContainer}
        placeholder="Select a time slot"
        // value={selectedTime}
        // onValueChange={(value) => setSelectedTime(value)}
      />
      {/* <Pressable onPress={handleAppointmentSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Book Appointment</Text>
      </Pressable> */}
      <AppButton title="Book Appointment" width={"75%"} backgroundColor={COLORS.primary} onPress={handleAppointmentSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    left:-24
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    borderRadius: 5,
    right:-24
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default BookAppointmentScreen;
