import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText, AppButton } from "@/components";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ReportProblem = () => {
  const router = useRouter();
  const [problemDescription, setProblemDescription] = useState("");

  const handleReportProblem = () => {
    // Logic to report the problem
    console.log("Problem reported:", problemDescription);
    // Optionally, you can add logic here to send the problem report to a server
    // or handle it in any other way your application requires.
    // Example:
    // dispatch(reportProblem(problemDescription));
    // onClose(); // Close modal or navigate back
  };

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
        <CustomText type="h2">Report a Problem</CustomText>
      </View>
      <View style={styles.content}>
        <CustomText type="body1">
          Describe the problem you encountered:
        </CustomText>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={problemDescription}
          onChangeText={setProblemDescription}
          placeholder="Enter your problem description here"
        />
        <AppButton
          title="Submit"
          onPress={handleReportProblem}
          backgroundColor={COLORS.primary}
          width={120}
          containerStyle={styles.submitButton}
        />
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
  content: {
    flex: 1,
    padding: 12,
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    textAlignVertical: "top",
    minHeight: 120,
  },
  submitButton: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
});

export default ReportProblem;
