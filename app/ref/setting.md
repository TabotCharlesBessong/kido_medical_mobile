```TSX
import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#007bff' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      <TouchableOpacity style={styles.settingContainer}>
        <Text style={styles.settingText}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingContainer}>
        <Text style={styles.settingText}>Privacy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingContainer}>
        <Text style={styles.settingText}>Help</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingContainer}>
        <Text style={styles.settingText}>About</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

------------------------------------------------------------
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const DoctorProfileScreen = ({ route, navigation }) => {
  const { doctor } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Doctor Profile</Text>
      </View>
      <Image source={{ uri: doctor.image }} style={styles.profileImage} />
      <Text style={styles.name}>{doctor.name}</Text>
      <Text style={styles.speciality}>{doctor.speciality}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{doctor.location}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Experience:</Text>
        <Text style={styles.value}>{doctor.experience} years</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Languages:</Text>
        <Text style={styles.value}>{doctor.language.join(', ')}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Consultation Fee:</Text>
        <Text style={styles.value}>${doctor.fee}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DoctorProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    color: '#007bff',
    marginRight: 20,
    fontSize: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  speciality: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    flex: 1,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});


```