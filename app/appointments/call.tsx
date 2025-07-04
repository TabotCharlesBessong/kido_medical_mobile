import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppButton, CustomText } from "@/components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  selectAppointmentById,
  updateAppointment,
} from "@/redux/slice/appointment.slice";
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  CallControls,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const VideoCallScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { appointmentId } = useLocalSearchParams();

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  const appointment = useSelector((state: RootState) =>
    selectAppointmentById(state, appointmentId as string)
  );

  useEffect(() => {
    if (!appointment) {
      router.back();
      return;
    }

    const initCall = async () => {
      try {
        // Initialize Stream client
        const streamClient = new StreamVideoClient({
          apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
          token: process.env.EXPO_PUBLIC_STREAM_TOKEN!,
          user: {
            id: appointment.patientId,
            name: appointment.patientName,
          },
        });

        setClient(streamClient);

        // Create or join call
        const newCall = streamClient.call("default", appointmentId as string);
        await newCall.join({ create: true });
        setCall(newCall);

        // Update appointment status
        await dispatch(
          updateAppointment({
            id: appointmentId as string,
            data: { status: "in_progress" },
          })
        ).unwrap();
      } catch (error) {
        console.error("Error initializing call:", error);
        router.back();
      }
    };

    initCall();

    return () => {
      if (call) {
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
    };
  }, [appointmentId]);

  const handleEndCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        client.disconnectUser();
      }

      // Update appointment status
      await dispatch(
        updateAppointment({
          id: appointmentId as string,
          data: { status: "completed" },
        })
      ).unwrap();

      router.back();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  if (!client || !call) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StreamVideo client={client}>
        <View style={styles.callContainer}>
          <View style={styles.participantsContainer}>
            <ParticipantView
              participant={call.localParticipant}
              style={styles.localParticipant}
            />
            {call.remoteParticipants.map((participant) => (
              <ParticipantView
                key={participant.sessionId}
                participant={participant}
                style={styles.remoteParticipant}
              />
            ))}
          </View>

          <View style={styles.controlsContainer}>
            <CallControls onHangupCall={handleEndCall} />
          </View>
        </View>
      </StreamVideo>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },
  callContainer: {
    flex: 1,
  },
  participantsContainer: {
    flex: 1,
    position: "relative",
  },
  localParticipant: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
  },
  remoteParticipant: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default VideoCallScreen; 