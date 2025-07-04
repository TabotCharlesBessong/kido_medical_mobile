import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '../../../redux/store';
import { fetchPrescriptions } from '../../../redux/slice/prescription.slice';
import { useAppDispatch } from '../../../redux/store';
import { format } from 'date-fns';

export default function Prescriptions() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const prescriptions = useSelector(selectPrescriptions);
  const loading = useSelector(selectPrescriptionsLoading);
  const error = useSelector(selectPrescriptionsError);

  useEffect(() => {
    dispatch(fetchPrescriptions());
  }, []);

  const renderPrescription = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.prescriptionCard}
      onPress={() => router.push(`/prescriptions/${item.id}`)}
    >
      <View style={styles.prescriptionHeader}>
        <Text style={styles.prescriptionDate}>
          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
      </View>

      <View style={styles.medicationsList}>
        {item.medications.map((med: any, index: number) => (
          <View key={index} style={styles.medicationItem}>
            <Text style={styles.medicationName}>{med.name}</Text>
            <Text style={styles.medicationDetails}>
              {med.dosage} - {med.frequency} for {med.duration}
            </Text>
          </View>
        ))}
      </View>

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          Notes: {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading prescriptions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchPrescriptions())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
      </View>

      {prescriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No prescriptions found
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescription}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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
  list: {
    padding: 16,
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  medicationsList: {
    marginBottom: 12,
  },
  medicationItem: {
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  medicationDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  notes: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
}); 