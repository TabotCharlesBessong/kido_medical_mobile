import React, { useState } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@/constants/theme";
import { AppButton, AuthCheckbox, CustomText } from "@/components";
import { useTranslation } from "react-i18next";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "@/utils/variables";

interface TimeSlotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (startTime: string, endTime: string, isAvailable: boolean) => void;
}

interface TimeSlotValues {
  startTime: Date | null;
  endTime: Date | null;
  isAvailable: boolean;
}

const initialValues: TimeSlotValues = {
  startTime: null,
  endTime: null,
  isAvailable: true,
};

const timeSlotSchema = yup.object().shape({
  startTime: yup.date().required("Start time is required"),
  endTime: yup.date().required("End time is required"),
  isAvailable: yup.boolean().required(),
});

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isVisible,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  const handleCreate = async (
    values: TimeSlotValues,
    actions: FormikHelpers<TimeSlotValues>
  ) => {
    if (values.startTime && values.endTime) {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const user = userData ? JSON.parse(userData) : null;
        const doctorId = user?.id;

        if (!doctorId) {
          throw new Error("Doctor ID not found");
        }

        const newTimeSlot = {
          doctorId,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          isAvailable: values.isAvailable,
        };

        const token = await AsyncStorage.getItem("userToken");

        const response = await axios.post(
          `${baseUrl}/doctor/create-time-slot`,
          newTimeSlot,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        onCreate(
          formatTime(values.startTime),
          formatTime(values.endTime),
          values.isAvailable
        );
        onClose();
      } catch (error) {
        Alert.alert("Error", t("timeslot.failedToCreateTimeSlot"));
      }
    } else {
      Alert.alert(t("timeslot.validationError"), t("timeslot.selectBothTimes"));
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <CustomText type="h3">{t("timeslot.createTimeSlot")}</CustomText>
          <Formik
            initialValues={initialValues}
            validationSchema={timeSlotSchema}
            onSubmit={handleCreate}
          >
            {({ handleSubmit, setFieldValue, values, errors, touched }) => (
              <>
                <TouchableOpacity
                  onPress={() => setFieldValue("showStartPicker", true)}
                  style={styles.timePickerButton}
                >
                  <CustomText type="body1">
                    {values.startTime
                      ? formatTime(values.startTime)
                      : t("timeslot.selectStartTime")}
                  </CustomText>
                </TouchableOpacity>
                {/* {values.showStartPicker && ( */}
                  <DateTimePicker
                    value={values.startTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setFieldValue("showStartPicker", false);
                      if (selectedDate) {
                        setFieldValue("startTime", selectedDate);
                      }
                    }}
                  />
                {/* // )} */}
                {errors.startTime && touched.startTime && (
                  <CustomText type="body4">{errors.startTime}</CustomText>
                )}

                <TouchableOpacity
                  onPress={() => setFieldValue("showEndPicker", true)}
                  style={styles.timePickerButton}
                >
                  <CustomText type="body1">
                    {values.endTime
                      ? formatTime(values.endTime)
                      : t("timeslot.selectEndTime")}
                  </CustomText>
                </TouchableOpacity>
                {/* {values.showEndPicker && ( */}
                  <DateTimePicker
                    value={values.endTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setFieldValue("showEndPicker", false);
                      if (selectedDate) {
                        setFieldValue("endTime", selectedDate);
                      }
                    }}
                  />
                {/* )} */}
                {errors.endTime && touched.endTime && (
                  <CustomText type="body4">{errors.endTime}</CustomText>
                )}

                <AuthCheckbox
                  isChecked={values.isAvailable}
                  onPress={() =>
                    setFieldValue("isAvailable", !values.isAvailable)
                  }
                  title={t("timeslot.weeklyAvailability")}
                />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                    marginTop: 12,
                  }}
                >
                  <AppButton
                    title={t("timeslot.create")}
                    onPress={handleSubmit}
                    width={120}
                    backgroundColor={COLORS.primary}
                  />
                  <AppButton
                    title={t("timeslot.cancel")}
                    onPress={onClose}
                    width={120}
                    backgroundColor={COLORS.danger}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  timePickerButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 5,
  },
});

export default TimeSlotModal;
