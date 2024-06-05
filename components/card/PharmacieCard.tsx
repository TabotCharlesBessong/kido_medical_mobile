import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

interface PharmacieCardProps {
  image:string
  name:string
  location:string
}

const PharmacieCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require("../../assets/images/pharmacie.jpeg")} style={{width:"100%",height:"100%"}} />
      </View>
      <View style={styles.textContainer} >
        <Text>PharmacieCard, hello </Text>
        <Text>PharmacieCard</Text>
      </View>
    </View>
  );
};

export default PharmacieCard;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: 200,
    width: 200,
    borderRadius: 16,
    paddingBottom:16,
    marginVertical:24,
    borderWidth:2,
    borderColor:"black",
    marginHorizontal:8
  },
  imageContainer: {
    width:"100%",
    height:150
  },
  textContainer:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  }
});
