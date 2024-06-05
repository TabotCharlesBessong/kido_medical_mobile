```TSX
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have installed react-native-vector-icons

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} color="#000" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://via.placeholder.com/100x40?text=Logo' }}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Features Section */}
      <View style={styles.features}>
        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('BookAppointment')}>
          <Text style={styles.featureText}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('MyAppointments')}>
          <Text style={styles.featureText}>My Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('FindDoctors')}>
          <Text style={styles.featureText}>Find Doctors</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.notifications}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {/* Add notification items here */}
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>You have an upcoming appointment with Dr. Smith</Text>
        </View>
      </View>

      {/* Recent Activities Section */}
      <View style={styles.activities}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {/* Add recent activity items here */}
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Consultation with Dr. John on 25th May</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 15,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notifications: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationItem: {
    padding: 15,
    backgroundColor: '#ffcc00',
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
  },
  activities: {
    marginBottom: 20,
  },
  activityItem: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  activityText: {
    fontSize: 16,
  },
});

export default HomeScreen;

import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import PharmacieCard from "@/components/PharmacieCard"; // Adjust the import based on your file structure
import generateRandomPharmaciesData from "../../utils/generateRandomPharmaciesData"; // Adjust the import based on your file structure

const PharmaciesScreen = () => {
  const pharmacyData = generateRandomPharmaciesData();
  console.log(pharmacyData);

  return (
    <View style={styles.container}>
      <FlatList
        data={pharmacyData}
        renderItem={({ item }) => (
          <PharmacieCard
            key={item.id}
            image={item.image}
            name={item.name}
            location={item.location}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

export default PharmaciesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
});

```