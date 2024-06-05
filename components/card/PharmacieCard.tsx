import { Image, StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import CustomText from "../texts/CustomText";

interface PharmacieCardProps {
  image:string
  name:string
  location:string
}

const PharmacieCard:FC<PharmacieCardProps> = ({image,name,location}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{uri:image}} style={styles.image} />
      </View>
      <View style={styles.textContainer} >
        <CustomText type="body2">{name}</CustomText>
        <CustomText type="body4">{location}</CustomText>
      </View>
    </View>
  );
};

export default PharmacieCard;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: 220,
    width: 250,
    borderRadius: 16,
    paddingBottom:16,
    marginVertical:24,
    borderWidth:2,
    borderColor:"black",
    marginHorizontal:8,
    maxHeight:"auto",
  },
  imageContainer: {
    width:"100%",
    height:150
  },
  textContainer:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },
  image:{
    width:"100%",
    height:"100%",
    borderTopLeftRadius:16,
    borderTopRightRadius:16
  },
});
