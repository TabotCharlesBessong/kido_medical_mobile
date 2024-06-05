import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DoctorCard } from "@/components";
import doctorsData from "../../constants/data/doctorData";

const DoctorScreen = () => {
  const doctorData = doctorsData();
  console.log(doctorData);

  return (
    <View style={styles.container}>
      <FlatList
        data={doctorData}
        renderItem={({ item }) => (
          <DoctorCard
            key={item.id}
            name={item.name}
            location={item.location}
            experience={item.experience}
            speciality={item.speciality}
            language={item.language}
            fee={item.fee} image={""} rating={0}          />
        )}
        keyExtractor={(item) => item.name.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

export default DoctorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
});
