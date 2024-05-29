import { Button, Image, StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

interface DoctorCardProps {
  image: string;
  name: string;
  rating: number;
  location: string;
  experience: number;
  speciality: string;
  language: string[];
  fee: number;
}

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
            source={require("../../assets/images/doctor.jpeg")}
            style={{ width: 150, height: 150, borderRadius: 75 }}
          />
        </View>
        <View>
          <Text>Dr James Smith</Text>
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
          <Text>Douala. Cameroon</Text>
          <Text>5+ years experience</Text>
          <Text>Pediatrician</Text>
        </View>
      </View>
      <View style={styles.lowerContainer}>
        <View>
          <Text>Language: English French</Text>
          <Text>Consultation Fee: 3000XAF</Text>
        </View>
        <View>
          <Text style={styles.outlineButton}>View Profile</Text>
        </View>
      </View>
      <View style={styles.bookContainer}>
        <Text>Click to book:</Text>
        <View style={styles.buttonContainer}>
          <Text style={styles.bookText}>Today</Text>
          <Text style={styles.bookText}>May 1</Text>
          <Text style={styles.bookText}>May 23</Text>
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
    width: "95%",
    marginHorizontal: "auto",
    borderWidth:1,
    borderColor:"black",
    borderRadius:16,
    marginBottom:12
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
});
