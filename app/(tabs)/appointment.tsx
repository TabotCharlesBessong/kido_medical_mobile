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
import { generateRandomAppointments } from "@/constants/data/appointment";

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

  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const { upcoming, past } = generateRandomAppointments();
    setUpcomingAppointments(upcoming);
    setPastAppointments(past);
  }, []);

  const handleAppointmentDetails = (appointment: Appointment) => {
    router.push({
      pathname: "/profile/appointmentDetails",
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
              ? COLORS.primary
              : item.appointmentStatus === "Pending"
              ? COLORS.danger
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
              ? COLORS.primary
              : item.appointmentStatus === "Pending"
              ? COLORS.danger
              : COLORS.danger
          }
        />
      </View>
      <CustomText type="body4">{item.doctorSpecialty}</CustomText>
      <CustomText type="body4">
        {item.date} - {item.time}
      </CustomText>
      <CustomText type="body4">{item.reason}</CustomText>
      <View style={{display:'flex',alignSelf:'flex-end'}}>
        <View style={{ width: 150 }}>
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
