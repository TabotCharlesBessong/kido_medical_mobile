import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { DoctorCard } from "@/components";
import doctorsData from "../../constants/data/doctorData";

const doctor = () => {
  const doctorData = doctorsData();
  console.log(doctorData);
  return (
    <View style={styles.container}>
      <ScrollView>
        {doctorData.map((item) => (
          <DoctorCard
            key={item.id}
            name={item.name}
            location={item.location}
            experience={item.experience}
            speciality={item.speciality}
            language={item.language}
            fee={item.fee}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default doctor;

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
