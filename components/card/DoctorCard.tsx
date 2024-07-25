import { Button, Image, StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { DoctorCardProps } from "@/constants/types";

const DoctorCard: FC<DoctorCardProps> = ({
  image,
  name,
  rating,
  location,
  experience,
  speciality,
  language,
  fee,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/doctor1.jpg")}
            // style={{ width: 150, height: 150, borderRadius: 75 }}
            style={styles.image}
          />
        </View>
        <View>
          <Text>{name}</Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginVertical: 12,
            }}
          >
            <AntDesign name="star" size={30} color="gold" />
            <AntDesign name="star" size={30} color="gold" />
            <AntDesign name="star" size={30} color="gold" />
            <AntDesign name="star" size={30} color="gold" />
            <FontAwesome name="star-half" size={30} color="gold" />
          </View>
          <Text>{location}</Text>
          <Text>{experience}+ years experience</Text>
          <Text>Pediatrician</Text>
        </View>
      </View>
      <View style={styles.lowerContainer}>
        <View>
          <Text>Language: {language}</Text>
          <Text>Consultation Fee: {fee}XAF</Text>
        </View>
        <View>
          <Text style={styles.outlineButton}>View Profile</Text>
        </View>
      </View>
      <View style={styles.bookContainer}>
        <Text>Click to book:</Text>
        <View style={styles.buttonContainer}>
          <Text style={styles.bookText}>Today</Text>
          <Text style={styles.bookText}>August 1</Text>
          <Text style={styles.bookText}>August 23</Text>
        </View>
      </View>
    </View>
  );
};

export default DoctorCard;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    padding: 8,
    width: 350,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 16,
    marginBottom: 12,
    height: 320,
    maxHeight: "auto",
  },
  upperContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  lowerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "black",
    marginTop: 8,
    paddingBottom: 6,
  },
  imageContainer: {
    width: "auto",
  },
  bookContainer: {
    marginVertical: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bookText: {
    width: 80,
    backgroundColor: "green",
    color: "white",
    textAlign: "center",
    borderRadius: 12,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  outlineButton: {
    backgroundColor: "white",
    color: "green",
    textAlign: "center",
    borderRadius: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "green",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});
