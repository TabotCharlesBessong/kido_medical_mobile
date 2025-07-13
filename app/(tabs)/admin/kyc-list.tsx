import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchPendingKycVerifications,
  verifyDoctorProfile, // Specific thunk for doctor verification
  // verifyKyc, // General KYC thunk if needed for other types of KYC
  removeKycFromPending,
  clearAdminError,
} from "@/redux/slice/adminSlice";
import { AppButton, CustomText } from "@/components";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser"; // For opening document URLs
import { COLORS } from "@/utils/constants";
import { KycVerification } from "@/constants/types/admin";

const AdminKycListScreen = () => {
  const dispatch: AppDispatch = useDispatch();
  const { pendingKyc, isLoading, error } = useSelector(
    (state: RootState) => state.admin
  );
  const user = useSelector((state: RootState) => state.auth.user); // Get current user for role check

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch and role check
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      Alert.alert(
        "Access Denied",
        "You do not have permission to view this page."
      );
      router.replace("/(tabs)"); // Redirect non-admins
      return;
    }
    dispatch(fetchPendingKycVerifications());
  }, [dispatch, user, router]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPendingKycVerifications());
    setRefreshing(false);
  }, [dispatch]);

  const handleVerify = async (
    kycId: string,
    userEmail: string,
    status: "approved" | "rejected"
  ) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${status.toLowerCase()} this doctor's verification?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            // Use verifyDoctorProfile specifically
            const resultAction = await dispatch(
              verifyDoctorProfile({
                email: userEmail,
                status: status,
                notes: `Admin ${status.toLowerCase()} verification at ${new Date().toLocaleString()}`,
              })
            );

            if (verifyDoctorProfile.fulfilled.match(resultAction)) {
              Alert.alert(
                "Success",
                `Doctor verification ${status.toLowerCase()} successfully.`
              );
              dispatch(removeKycFromPending(kycId)); // Remove from list immediately
            }
          },
        },
      ]
    );
  };

  const openDocument = async (url: string) => {
    if (url) {
      const result = await WebBrowser.openBrowserAsync(url);
      if (result.type === "cancel") {
        Alert.alert("Action Cancelled", "Document view was cancelled.");
      }
    } else {
      Alert.alert("No Document", "No document URL available for this request.");
    }
  };

  const renderItem = ({ item }: { item: KycVerification }) => (
    <View style={styles.kycCard}>
      <CustomText type="h4">
        {item.type} Verification Request
      </CustomText>
      <CustomText type="body4">
        User: {item.user.firstname} {item.user.lastname} ({item.user.email})
      </CustomText>
      {item.doctorProfile && (
        <CustomText type="body4">
          Specialization: {item.doctorProfile.specialization}, Fee: $
          {item.doctorProfile.fee}
        </CustomText>
      )}
      <CustomText type="body4">
        Status:{" "}
        <Text
          style={{
            color: item.status === "pending" ? COLORS.warning : COLORS.gray,
          }}
        >
          {item.status}
        </Text>
      </CustomText>
      <CustomText type="body4">
        Request Date: {new Date(item.createdAt).toLocaleDateString()}
      </CustomText>

      {item.documents && item.documents.length > 0 && (
        <AppButton
          title={`View Document${item.documents.length > 1 ? "s" : ""}`}
          onPress={() => openDocument(item.documents[0])} // Assuming one primary document or pick first
          backgroundColor={COLORS.secondary}
          textColor={COLORS.dark}
          containerStyle={styles.viewDocButton}
          titleStyle={styles.viewDocButtonTitle}
        />
      )}

      {item.status === "pending" && (
        <View style={styles.buttonContainer}>
          <AppButton
            title="Approve"
            onPress={() => handleVerify(item.id, item.user.email, "approved")}
            backgroundColor={COLORS.success}
            containerStyle={styles.actionButton}
            loading={isLoading}
          />
          <AppButton
            title="Reject"
            onPress={() => handleVerify(item.id, item.user.email, "rejected")}
            backgroundColor={COLORS.danger}
            containerStyle={styles.actionButton}
            loading={isLoading}
          />
        </View>
      )}
    </View>
  );

  if (isLoading && pendingKyc.length === 0 && !error) {
    // Only show full loading indicator if no data and no error
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading pending verifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1">
        Pending KYC Verifications
      </CustomText>
      {pendingKyc.length === 0 && !isLoading ? ( // Show empty message only if not loading and no items
        <View style={styles.emptyContainer}>
          <CustomText type="body1">
            No pending KYC requests found.
          </CustomText>
          <AppButton
            title="Refresh"
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: "50%" }}
          />
        </View>
      ) : (
        <FlatList
          data={pendingKyc}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default AdminKycListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#F7F7F7", // Assuming a background color from COLORS
    paddingTop: 50, // Adjust for status bar/notch
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text || "#333",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  kycCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray || "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
    color: COLORS.dark || "#333",
  },
  viewDocButton: {
    marginTop: 10,
    width: "60%", // narrower button
    alignSelf: "center",
    height: 35, // smaller height
    borderRadius: 18,
    backgroundColor: COLORS.info || "#007BFF",
  },
  viewDocButtonTitle: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  actionButton: {
    width: "45%",
    height: 40,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray || "#666",
    textAlign: "center",
  },
});
