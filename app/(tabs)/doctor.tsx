import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { DoctorCard } from '@/components';

const doctor = () => {
  return (
    <View style={styles.container}>
      <ScrollView>

      <DoctorCard />
      <DoctorCard />
      <DoctorCard />
      <DoctorCard />
      <DoctorCard />
      <DoctorCard />
      </ScrollView>
    </View>
  );
}

export default doctor

const styles = StyleSheet.create({
  container: {
    display: "flex",
    padding: 8,
    width: "95%",
    marginHorizontal: "auto",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 16,
    marginBottom: 12,
  },
});