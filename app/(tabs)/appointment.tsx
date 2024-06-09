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
import { CustomText } from "@/components";
import { generateRandomAppointments } from "@/constants/data/appointment";

interface Appointment {
  id: number;
  doctor: string;
  date: string;
  time: string;
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

  const handleAppointmentDetails = (appointmentId: number) => {
    router.push(`/appointment-details/${appointmentId}`);
  };

  const handleNewAppointment = () => {
    router.push("/book-appointment");
  };

  const renderAppointmentItem = ({ item }: RenderAppointmentItemProps) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => handleAppointmentDetails(item.id)}
    >
      <CustomText type="body3">{item.doctor}</CustomText>
      <CustomText type="body4">
        {item.date} - {item.time}
      </CustomText>
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
          renderItem={renderAppointmentItem}
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
});

export default AppointmentsScreen;
