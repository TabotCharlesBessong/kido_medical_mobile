import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  CallContent,
  CallControls,
  useStreamVideoClient, // This hook is critical to get the client from context
  Call, // The Call class itself
  // Stream provides types like `CallEndedEvent` which might contain reason
} from "@stream-io/video-react-native-sdk"; // Use specific imports
import { useTranslation } from "react-i18next";
import { COLORS } from "@/utils/constants";
import {
  prepareToJoinStreamCall, // Thunk to confirm client readiness and get streamCallId
  endBackendCall,
  resetCallState,
  clearCallError,
  setCallStatus, // To update Redux status
  fetchCallRecordById, // For ensuring we have the backend CallRecord ID
} from "@/redux/slice/callSlice";
import { CustomText, AppButton } from "@/components";
import { FontAwesome } from "@expo/vector-icons";

const CallScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { streamCallId } = useLocalSearchParams<{ streamCallId: string }>(); // This is the Stream.io channel ID

  const videoClient = useStreamVideoClient(); // Get the Stream Video client from context provided by _layout.tsx
  const { currentBackendCallRecord, callStatus, callError } = useSelector(
    (state: RootState) => state.call
  );
  const streamIsConnected = useSelector(
    (state: RootState) => state.stream.isConnected
  );

  const [localStreamCallInstance, setLocalStreamCallInstance] =
    useState<Call | null>(null); // State to hold the Stream SDK Call object
  const hasAttemptedJoinRef = useRef(false); // Using ref to prevent re-joining on re-renders

  useEffect(() => {
    if (callError) {
      Alert.alert(t("common.error"), callError);
      dispatch(clearCallError());
    }
  }, [callError, dispatch, t]);

  // Main effect to set up and join the Stream call
  useEffect(() => {
    const setupAndJoinCall = async () => {
      if (
        !streamCallId ||
        !videoClient ||
        !streamIsConnected ||
        hasAttemptedJoinRef.current
      ) {
        // Essential prerequisites not met or already attempted
        return;
      }

      hasAttemptedJoinRef.current = true; // Mark as attempted
      dispatch(setCallStatus("joining"));

      try {
        // Use the StreamVideoClient to create the specific Call instance
        const call = videoClient.call("default", streamCallId); // 'default' is the Stream call type
        setLocalStreamCallInstance(call); // Store the Stream Call object in local state

        // Listen for call ended events from Stream SDK
        const unsubscribeCallEnded = call.on("call.ended", (event) => {
          console.log("Stream Call Ended by remote/SDK:", event);
          // If the call ended from the SDK side (e.g., remote peer hung up), update backend and navigate
          if (
            currentBackendCallRecord?.id &&
            callStatus !== "ended" &&
            callStatus !== "leaving"
          ) {
            dispatch(endBackendCall({ callId: currentBackendCallRecord.id }));
          }
          router.replace("/(tabs)"); // Navigate back after call ends
        });

        // Try to join the call
        await call.join();
        dispatch(setCallStatus("connected"));
        console.log(`Successfully joined Stream call: ${streamCallId}`);
      } catch (e: any) {
        console.error("Error setting up/joining Stream SDK call:", e);
        Alert.alert(t("common.error"), e.message || t("call.joinFailedSDK"));
        dispatch(setCallStatus("failed"));
        router.replace("/(tabs)"); // Navigate back if join fails
      }
    };

    setupAndJoinCall();

    // Cleanup: Ensure call is left and Redux state is reset when component unmounts
    return () => {
      if (
        localStreamCallInstance &&
        (localStreamCallInstance.state.callingState === "connected" ||
          localStreamCallInstance.state.callingState === "joining")
      ) {
        localStreamCallInstance
          .leave()
          .catch((err) => console.error("Error leaving call on unmount:", err));
      }
      dispatch(resetCallState()); // Reset Redux call state
      hasAttemptedJoinRef.current = false; // Reset ref for next mount
    };
  }, [
    dispatch,
    streamCallId,
    videoClient,
    streamIsConnected,
    router,
    currentBackendCallRecord?.id,
    callStatus,
    t,
  ]);

  // Effect to fetch the backend call record if it's not already loaded in Redux state
  // This is important because the CallScreen only receives `streamCallId` from router params,
  // but `endBackendCall` needs the backend's `currentBackendCallRecord.id`.
  useEffect(() => {
    if (!currentBackendCallRecord && streamCallId) {
      // You need a way to get the backend's CallRecord.id from streamCallId.
      // Your backend only exposes `GET /call/:callId` by your internal call ID.
      // For this to work, you either need:
      // 1. To pass the backend's `callRecord.id` in router params from the previous screen.
      // 2. A new backend endpoint: `GET /api/call/byStreamId/:streamCallId`.
      // 3. Ensure the `initiateCall` or `fetchPatientAppointments` / `fetchDoctorAppointments` already populates `currentBackendCallRecord.id` and `streamCallId` correctly.
      // Assuming for now that `currentBackendCallRecord` will be present from `initiateCall` or loaded with appointment.
      // If not, a lookup here is necessary. For safety, we'll try to fetch based on streamCallId (if backend endpoint exists)
      // or assume it's passed as `callRecordId` alongside `streamCallId` in params.
      // If you passed `callRecordId` from previous screen:
      // const { callRecordId } = useLocalSearchParams<{ callRecordId: string; streamCallId: string }>();
      // if (callRecordId) {
      //   dispatch(fetchCallRecordById(callRecordId));
      // }
      // Else, this would be a backend lookup:
      // dispatch(fetchBackendCallRecordByStreamId(streamCallId)); // This thunk would need to be created if needed
    }
  }, [currentBackendCallRecord, streamCallId, dispatch]);

  const handleEndCall = async () => {
    Alert.alert(
      t("call.endCallConfirmTitle"),
      t("call.endCallConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("call.endCall"),
          style: "destructive",
          onPress: async () => {
            if (localStreamCallInstance) {
              // First, leave the Stream SDK call
              await localStreamCallInstance
                .leave()
                .catch((err) =>
                  console.error("Error leaving Stream SDK call:", err)
                );
            }

            // Then, inform your backend to end the call record
            if (currentBackendCallRecord?.id) {
              await dispatch(
                endBackendCall({ callId: currentBackendCallRecord.id })
              );
            } else {
              console.warn(
                "Backend call record ID not found, cannot end backend call."
              );
              Alert.alert(t("common.error"), t("call.backendRecordNotFound"));
            }
            router.replace("/(tabs)"); // Navigate back to main app
          },
        },
      ]
    );
  };

  // Render loading state if Stream clients are not ready or call is joining
  if (
    !streamIsConnected ||
    !videoClient ||
    !streamCallId ||
    (callStatus === "joining" && !localStreamCallInstance)
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("call.connectingToCall")}
        </CustomText>
      </View>
    );
  }

  // Handle case where Stream SDK call instance might not be set up (e.g. after error or before async setup)
  if (!localStreamCallInstance) {
    return (
      <View style={styles.errorContainer}>
        <CustomText type="body1" style={styles.errorText}>
          {callError || t("call.callNotReady")}
        </CustomText>
        <AppButton title={t("common.goBack")} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    // CallsProvider is no longer needed/exported in newer SDK versions.
    // StreamVideo component in _layout.tsx already provides the context.
    <View style={styles.container}>
      <CallContent
        call={localStreamCallInstance} // Pass the local Call instance directly
        CallControls={CallControls} // Use default controls provided by Stream SDK
        // You can pass custom UI components for controls if you want
      />
      {/* Floating end call button */}
      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <FontAwesome
          name="phone"
          size={30}
          color={COLORS.white}
          style={styles.endCallIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", // Video call background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  endCallButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: COLORS.danger,
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10, // Ensure it's above other elements
  },
  endCallIcon: {
    transform: [{ rotate: "135deg" }], // Rotate for phone hang-up icon
  },
});
