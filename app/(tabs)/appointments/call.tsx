import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  CallControls,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { useAppDispatch } from '../../../redux/store';
import { updateAppointment } from '../../../redux/slice/appointment.slice';

export default function VideoCall() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { appointmentId } = useLocalSearchParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const appointment = useSelector((state: RootState) =>
    state.appointments.appointments.find(apt => apt.id === appointmentId)
  );

  const { useCallEnded } = useCallStateHooks();
  const callEnded = useCallEnded();

  useEffect(() => {
    initializeCall();
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, []);

  useEffect(() => {
    if (callEnded) {
      handleCallEnd();
    }
  }, [callEnded]);

  const initializeCall = async () => {
    try {
      if (!user || !appointment) {
        throw new Error('User or appointment not found');
      }

      // Initialize Stream client
      const streamClient = new StreamVideoClient({
        apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
        user: {
          id: user.id,
          name: user.name,
        },
        token: user.streamToken,
      });

      setClient(streamClient);

      // Create or join call
      const callInstance = streamClient.call('default', appointmentId as string);
      await callInstance.getOrCreate();
      setCall(callInstance);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize call');
      setLoading(false);
    }
  };

  const handleCallEnd = async () => {
    try {
      if (appointmentId) {
        await dispatch(updateAppointment({
          id: appointmentId as string,
          data: { status: 'completed' }
        })).unwrap();
      }
      router.replace('/(tabs)/appointments');
    } catch (err: any) {
      console.error('Error updating appointment:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing call...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!client || !call) {
    return null;
  }

  return (
    <StreamVideo client={client}>
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <ParticipantView
            participant={call.localParticipant}
            style={styles.localVideo}
          />
          {call.remoteParticipants.map((participant) => (
            <ParticipantView
              key={participant.sessionId}
              participant={participant}
              style={styles.remoteVideo}
            />
          ))}
        </View>
        <View style={styles.controlsContainer}>
          <CallControls />
        </View>
      </View>
    </StreamVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 8,
    zIndex: 1,
  },
  remoteVideo: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 