import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchAllDoctors,
  clearDoctorProfileError,
} from "@/redux/slice/doctorProfileSlice";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { DoctorListItem } from "@/constants/types/doctor";

const DoctorListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { allDoctors, isLoading, error } = useSelector(
    (state: RootState) => state.doctorProfile
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Alert.alert(t('common.error'), error); // Alert already handled by Axios interceptor/global error handling
      dispatch(clearDoctorProfileError());
    }
  }, [error, dispatch, t]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAllDoctors());
    setRefreshing(false);
  }, [dispatch]);

  const handleSelectDoctor = (doctor: DoctorListItem) => {
    router.push({
      // @ts-ignore
      pathname: `/book-appointment/doctor-detail`,
      params: {
        doctorId: doctor.id,
        doctorName: `${doctor.firstname} ${doctor.lastname}`,
      }, // Pass info for next screen
    });
  };

  const renderDoctorItem = ({ item }: { item: DoctorListItem }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleSelectDoctor(item)}
    >
      <CustomText type="h4" style={styles.cardHeader}>
        {item.firstname} {item.lastname}
      </CustomText>
      <CustomText type="body3">
        {t("doctorList.specialization")}:{" "}
        {item.doctorProfile?.specialization || "N/A"}
      </CustomText>
      <CustomText type="body3">
        {t("doctorList.fee")}: ${item.doctorProfile?.fee || "N/A"}
      </CustomText>
      <CustomText type="body3" style={styles.viewDetailsText}>
        {t("doctorList.viewDetails")}
      </CustomText>
    </TouchableOpacity>
  );

  if (isLoading && allDoctors.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingDoctors")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>
        {t("doctorList.title")}
      </CustomText>
      {allDoctors.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("doctorList.noDoctors")}
          </CustomText>
          <AppButton
            title={t("common.refresh")}
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: "50%" }}
          />
        </View>
      ) : (
        <FlatList
          data={allDoctors.filter(
            (d:any) => d.doctorProfile?.verificationStatus === "APPROVED"
          )} // Filter only approved doctors
          keyExtractor={(item) => item.id}
          renderItem={renderDoctorItem}
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

export default DoctorListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#F7F7F7",
    paddingTop: 50,
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
  doctorCard: {
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
  viewDetailsText: {
    marginTop: 10,
    color: COLORS.info,
    textDecorationLine: "underline",
    alignSelf: "flex-end",
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
