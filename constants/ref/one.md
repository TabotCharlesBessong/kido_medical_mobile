Sure, I'll make the adjustments so that the data in the `AppointmentDetailsScreen` comes from the route params, and I'll add the `ChatScreen` and `CallScreen`.

### Updated AppointmentsScreen

First, update the `AppointmentsScreen` to pass the appointment data in the route params when navigating to the details screen.

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

  const handleAppointmentDetails = (appointment: Appointment) => {
    router.push({
      pathname: "/appointment-details",
      params: { appointment: JSON.stringify(appointment) },
    });
  };

  const handleNewAppointment = () => {
    router.push("/doctor/book-appointment");
  };

  const renderAppointmentItem = ({ item }: RenderAppointmentItemProps) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item)}
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
      onPress={() => handleAppointmentDetails(item)}
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

Now, let's update the `AppointmentDetailsScreen` to read the appointment data from the route params.

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSearchParams } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { COLORS } from "@/constants/theme";

const AppointmentDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { appointment } = useSearchParams();
  const appointmentData = JSON.parse(appointment);

  const handleChat = () => {
    router.push(`/chat/${appointmentData.id}`);
  };

  const handleCall = () => {
    router.push(`/call/${appointmentData.id}`);
  };

  const handlePrescribe = () => {
    router.push(`/prescribe/${appointmentData.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type="h1">Appointment Details</CustomText>
      </View>
      <View style={styles.detailsContainer}>
        <CustomText type="body3">Doctor: {appointmentData.doctorName}</CustomText>
        <CustomText type="body4">Specialty: {appointmentData.doctorSpecialty}</CustomText>
        <CustomText type="body4">Date: {appointmentData.date}</CustomText>
        <CustomText type="body4">Time: {appointmentData.time}</CustomText>
        <CustomText type="body4">Reason: {appointmentData.reason}</CustomText>
        <CustomText type="body4">Status: {appointmentData.appointmentStatus}</CustomText>
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

### ChatScreen and CallScreen

Now, let's create simple `ChatScreen` and `CallScreen` components.

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSearchParams } from "expo-router";
import { CustomText } from "@/components";
import { COLORS } from "@/constants/theme";

const ChatScreen: React

.FC = () => {
  const { appointmentId } = useSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type="h1">Chat</CustomText>
      </View>
      <View style={styles.chatContainer}>
        <CustomText type="body3">Chat for appointment ID: {appointmentId}</CustomText>
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
  chatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
```

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSearchParams } from "expo-router";
import { CustomText } from "@/components";
import { COLORS } from "@/constants/theme";

const CallScreen: React.FC = () => {
  const { appointmentId } = useSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText type="h1">Call</CustomText>
      </View>
      <View style={styles.callContainer}>
        <CustomText type="body3">Call for appointment ID: {appointmentId}</CustomText>
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
  callContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CallScreen;
```

With these updates, the appointment details will be passed as route params, and you will have screens for chat and call functionality that display the appointment ID.