### Update Mock Data Generation

First, let's update the mock data generation function to include `doctorName`, `doctorSpecialty`, and `appointmentStatus`.

```typescript
// utils/randomData.js

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  appointmentStatus: "Pending" | "Approved" | "Cancelled";
}

interface AppointmentsScreenProps {
  // Props if any
}

interface RenderAppointmentItemProps {
  item: Appointment;
}

export const generateRandomAppointments = () => {
  const doctorNames = ["Dr. Smith", "Dr. Doe", "Dr. Brown", "Dr. White", "Dr. Green"];
  const doctorSpecialties = ["Cardiology", "Dermatology", "Pediatrics", "Neurology", "General Medicine"];

  const dates = ["June 12, 2024", "June 15, 2024", "June 20, 2024", "June 25, 2024", "June 30, 2024"];
  const times = ["10:00 AM", "02:00 PM", "04:00 PM", "08:00 AM", "11:00 AM"];

  const statuses = ["Pending", "Approved", "Cancelled"];

  const generateRandomId = () => Math.floor(Math.random() * 1000).toString();

  const generateAppointments = (count: number) => {
    return Array.from({ length: count }, () => ({
      id: generateRandomId(),
      doctorName: doctorNames[Math.floor(Math.random() * doctorNames.length)],
      doctorSpecialty: doctorSpecialties[Math.floor(Math.random() * doctorSpecialties.length)],
      date: dates[Math.floor(Math.random() * dates.length)],
      time: times[Math.floor(Math.random() * times.length)],
      reason: "Hello i have a pain in my stomach is like my liver is down",
      appointmentStatus: statuses[Math.floor(Math.random() * statuses.length)],
    }));
  };

  return {
    upcoming: generateAppointments(6),
    past: generateAppointments(4),
  };
};
```

### Update AppointmentsScreen to Display New Data

Next, update the `AppointmentsScreen` to display the new fields, including an icon for the appointment status.

```typescript
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { generateRandomAppointments } from "@/utils/randomData";

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  appointmentStatus: "Pending" | "Approved" | "Cancelled";
}

interface AppointmentsScreenProps {
  // Props if any
}

interface RenderAppointmentItemProps {
  item: Appointment;
}

const AppointmentsScreen: React.FC<AppointmentsScreenProps> = () => {
  const router = useRouter();

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const { upcoming, past } = generateRandomAppointments();
    setUpcomingAppointments(upcoming);
    setPastAppointments(past);
  }, []);

  const handleAppointmentDetails = (appointmentId: number) => {
    router.push({
      pathname: "/appointment-details",
      params: { appointmentId },
    });
  };

  const handleNewAppointment = () => {
    router.push("/doctor/book-appointment");
  };

  const renderAppointmentItem = ({ item }: RenderAppointmentItemProps) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item.id)}
    >
      <View style={styles.appointmentHeader}>
        <CustomText type="body3">{item.doctorName}</CustomText>
        <MaterialIcons
          name={
            item.appointmentStatus === "Approved"
              ? "check-circle"
              : item.appointmentStatus === "Pending"
              ? "hourglass-empty"
              : "cancel"
          }
          size={24}
          color={
            item.appointmentStatus === "Approved"
              ? COLORS.success
              : item.appointmentStatus === "Pending"
              ? COLORS.warning
              : COLORS.danger
          }
        />
      </View>
      <CustomText type="body4">{item.doctorSpecialty}</CustomText>
      <CustomText type="body4">
        {item.date} - {item.time}
      </CustomText>
      <CustomText type="body4">{item.reason}</CustomText>
      <View style={styles.buttonContainer}>
        <View style={{ width: "40%" }}>
          <AppButton title="Start" onPress={() => {}} />
        </View>
        <View style={{ width: "40%" }}>
          <AppButton
            backgroundColor={COLORS.danger}
            title="Cancel"
            onPress={() => {}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPastAppointmentItem = ({ item }: RenderAppointmentItemProps) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item.id)}
    >
      <View style={styles.appointmentHeader}>
        <CustomText type="body3">{item.doctorName}</CustomText>
        <MaterialIcons
          name={
            item.appointmentStatus === "Approved"
              ? "check-circle"
              : item.appointmentStatus === "Pending"
              ? "hourglass-empty"
              : "cancel"
          }
          size={24}
          color={
            item.appointmentStatus === "Approved"
              ? COLORS.success
              : item.appointmentStatus === "Pending"
              ? COLORS.warning
              : COLORS.danger
          }
        />
      </View>
      <CustomText type="body4">{item.doctorSpecialty}</CustomText>
      <CustomText type="body4">
        {item.date} - {item.time}
      </CustomText>
      <CustomText type="body4">{item.reason}</CustomText>
      <View style={styles.buttonContainer}>
        <View style={{ width: "40%" }}>
          <AppButton
            backgroundColor={COLORS.danger}
            title="Delete"
            onPress={() => {}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <CustomText type="h1">Appointments</CustomText>
          <TouchableOpacity onPress={handleNewAppointment}>
            <MaterialIcons
              name="add-circle-outline"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <CustomText type="h2">Upcoming Appointments</CustomText>
        <FlatList
          data={upcomingAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.appointmentList}
        />

        <CustomText type="h2">Past Appointments</CustomText>
        <FlatList
          data={pastAppointments}
          renderItem={renderPastAppointmentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.appointmentList}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  appointmentList: {
    marginBottom: 20,
  },
  appointmentItem: {
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginVertical: 5,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default AppointmentsScreen;
```

### AppointmentDetailsScreen

Finally, create the `AppointmentDetailsScreen` to show the details of an appointment and provide options to chat, call, or prescribe.

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSearchParams } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";
import { appointmentsData } from "@/utils/randomData"; // Assumes you store generated appointments here

const AppointmentDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { appointmentId } = useSearchParams();

  const appointment = appointmentsData.upcoming.find(
    (item) => item.id.toString() === appointmentId
  );

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomText type="h1">Appointment not found</CustomText>
      </

SafeAreaView>
    );
  }

  const handleChat = () => {
    router.push(`/chat/${appointmentId}`);
  };

  const handleCall = () => {
    router.push(`/call/${appointmentId}`);
  };

  const handlePrescribe = () => {
    router.push(`/prescribe/${appointmentId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type="h1">Appointment Details</CustomText>
      </View>
      <View style={styles.detailsContainer}>
        <CustomText type="body3">Doctor: {appointment.doctorName}</CustomText>
        <CustomText type="body4">Specialty: {appointment.doctorSpecialty}</CustomText>
        <CustomText type="body4">Date: {appointment.date}</CustomText>
        <CustomText type="body4">Time: {appointment.time}</CustomText>
        <CustomText type="body4">Reason: {appointment.reason}</CustomText>
        <CustomText type="body4">Status: {appointment.appointmentStatus}</CustomText>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton title="Chat" onPress={handleChat} />
        <AppButton title="Call" onPress={handleCall} />
        <AppButton title="Prescribe" onPress={handlePrescribe} />
      </View>
    </SafeAreaView>
  );
};

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
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

export default AppointmentDetailsScreen;
```

### Navigation to Chat and Call Screens

Make sure you have the corresponding `ChatScreen` and `CallScreen` to handle the navigation from the detailed screen.

With these updates, you should be able to see the new fields in the appointment list, including the status icons, and navigate to a detailed view where you can start a chat, a call, or prescribe medication.