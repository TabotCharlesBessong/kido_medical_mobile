import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RootState } from '../../../redux/store';
import { createAppointment } from '../../../redux/slice/appointment.slice';
import { useAppDispatch } from '../../../redux/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function BookAppointment() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { doctorId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const doctor = useSelector((state: RootState) => 
    state.doctor.doctors.find(d => d.id === doctorId)
  );

  useEffect(() => {
    if (doctorId) {
      fetchAvailableTimeSlots();
    }
  }, [doctorId, selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    try {
      const response = await api.get(`/timeslots/available/${doctorId}`, {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd')
        }
      });
      setAvailableTimeSlots(response.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      Alert.alert('Error', 'Failed to fetch available time slots');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setSelectedTimeSlot(null);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      await dispatch(createAppointment({
        doctorId: doctorId as string,
        timeslotId: selectedTimeSlot,
        date: format(selectedDate, 'yyyy-MM-dd'),
      })).unwrap();

      Alert.alert(
        'Success',
        'Appointment booked successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Appointment</Text>
        {doctor && (
          <Text style={styles.doctorName}>with Dr. {doctor.name}</Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {format(selectedDate, 'MMMM dd, yyyy')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.timeSlotsContainer}>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlot === slot && styles.selectedTimeSlot
                  ]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTimeSlot === slot && styles.selectedTimeSlotText
                    ]}
                  >
                    {format(new Date(slot), 'hh:mm a')}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSlotsText}>
                No available time slots for this date
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={loading || !selectedTimeSlot}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  doctorName: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: '30%',
  },
  selectedTimeSlot: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    width: '100%',
  },
  bookButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  bookButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 

// export default BookAppointment