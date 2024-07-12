import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const FreeSpace = () => {
  const router = useRouter();

  const handleClearCache = () => {
    // Logic to clear cache
    console.log("Cache cleared");
  };

  const handleClearDownloads = () => {
    // Logic to clear downloads
    console.log("Downloads cleared");
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
        <CustomText type="h2">Free Up Space</CustomText>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
          <CustomText type="body1" >
            Clear Cache
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearDownloads}
        >
          <CustomText type="body1" >
            Clear Downloads
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
  content: {
    padding: 12,
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  clearButtonText: {
    color: COLORS.white,
  },
});

export default FreeSpace;
