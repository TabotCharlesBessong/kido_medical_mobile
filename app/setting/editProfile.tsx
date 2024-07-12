import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const EditProfile = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="keyboard-arrow-left"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
        <CustomText type="h2">Edit Profile</CustomText>
      </View>
      <View style={styles.form}>
        <CustomText type="body1">
          Name
        </CustomText>
        <TextInput style={styles.input} placeholder="Enter your name" />
        <CustomText type="body1" >
          Email
        </CustomText>
        <TextInput style={styles.input} placeholder="Enter your email" />
        <CustomText type="body1" >
          Phone
        </CustomText>
        <TextInput style={styles.input} placeholder="Enter your phone number" />
        <TouchableOpacity style={styles.saveButton}>
          <CustomText type="body1" >
            Save Changes
          </CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
  },
  backButton: {},
  form: {
    padding: 12,
  },
  label: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: COLORS.white,
  },
});

export default EditProfile;
