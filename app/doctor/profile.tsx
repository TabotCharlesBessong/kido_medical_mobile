import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { CustomText } from '@/components';

const profile = () => {
  const router = useRouter()
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <CustomText type="h1">Doctor Profile</CustomText>
      </View>
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: "../../assets/images/doctor.jpeg" }}
          style={styles.profileImage}
        />
      </View>
      <CustomText type="h2">Ebot Bessong</CustomText>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Speciality:</CustomText>
        <CustomText type="h4">Generalist</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Location:</CustomText>
        <CustomText type="h4">Douala Cameroon</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Experience:</CustomText>
        <CustomText type="h4">3+ years</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Languages:</CustomText>
        <CustomText type="h4">English, French</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Consultation Fee:</CustomText>
        <CustomText type="h4">22000 XAF</CustomText>
      </View>
      <View style={styles.infoContainer}>
        <CustomText type="body2">Consultation Fee:</CustomText>
        <CustomText type="h4">22000 XAF</CustomText>
      </View>
      <View>
        <CustomText type="body2">Summary:</CustomText>
        <CustomText type="h4">
          Dr. Jason graduated from North Eastern University school of Medicine
          in 1992. He works in New York, NY and 2 other locations and
          specializes in Hand surgery, Orthopedic surgery, and Sports medicine.
          Dr. Smith is affiliated with Northeastern medicine laboratory
        </CustomText>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/doctor/book-appointment")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/consult")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>Consult Patient</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/prescribe")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>Prescribe to Patient</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/prescriptions")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>View Prescriptions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/createPost")}
        style={[styles.button, { marginBottom: 24 }]}
      >
        <Text style={styles.buttonText}>Create Post</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/doctor/timeslot")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Time slot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom:50
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    color: "#007bff",
    marginRight: 20,
    fontSize: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  speciality: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems:"center",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});