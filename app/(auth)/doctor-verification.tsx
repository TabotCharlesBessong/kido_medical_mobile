import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native-gesture-handler';
import { RootState } from '../../redux/store';
import api from '../../utils/api';
import { setUser } from '../../redux/slice/auth.slice';

export default function DoctorVerification() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    hospital: '',
    document: null as any,
  });

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          document: result.assets[0]
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setError('Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience);
      formDataToSend.append('hospital', formData.hospital);
      
      if (formData.document) {
        formDataToSend.append('document', {
          uri: formData.document.uri,
          type: 'image/jpeg',
          name: 'license.jpg',
        });
      }

      const response = await api.post('/doctors/verify', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.user) {
        dispatch(setUser(response.data.user));
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Verification</Text>
        <Text style={styles.subtitle}>Please provide your medical credentials</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={styles.input}
            value={formData.specialization}
            onChangeText={(text) => setFormData(prev => ({ ...prev, specialization: text }))}
            placeholder="e.g., Cardiologist, Pediatrician"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Number</Text>
          <TextInput
            style={styles.input}
            value={formData.licenseNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, licenseNumber: text }))}
            placeholder="Enter your medical license number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            value={formData.yearsOfExperience}
            onChangeText={(text) => setFormData(prev => ({ ...prev, yearsOfExperience: text }))}
            placeholder="Enter years of experience"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hospital/Clinic</Text>
          <TextInput
            style={styles.input}
            value={formData.hospital}
            onChangeText={(text) => setFormData(prev => ({ ...prev, hospital: text }))}
            placeholder="Enter your hospital or clinic name"
          />
        </View>

        <View style={styles.documentUpload}>
          <Text style={styles.label}>Upload License Document</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>
              {formData.document ? 'Change Document' : 'Select Document'}
            </Text>
          </TouchableOpacity>
          {formData.document && (
            <Image
              source={{ uri: formData.document.uri }}
              style={styles.documentPreview}
            />
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Verification'}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  documentUpload: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentPreview: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
  error: {
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 