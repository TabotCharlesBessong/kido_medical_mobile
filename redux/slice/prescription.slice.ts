import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { RootState } from '../store';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionState {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescriptions: [],
  loading: false,
  error: null,
};

export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/prescriptions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const createPrescription = createAsyncThunk(
  'prescriptions/create',
  async (prescriptionData: Partial<Prescription>, { rejectWithValue }) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create prescription');
    }
  }
);

export const updatePrescription = createAsyncThunk(
  'prescriptions/update',
  async ({ id, data }: { id: string; data: Partial<Prescription> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/prescriptions/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prescription');
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    clearPrescriptions: (state) => {
      state.prescriptions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.prescriptions.push(action.payload);
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        const index = state.prescriptions.findIndex(pres => pres.id === action.payload.id);
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
      });
  },
});

export const { clearPrescriptions } = prescriptionSlice.actions;
export const selectPrescriptions = (state: RootState) => state.prescriptions.prescriptions;
export const selectPrescriptionsLoading = (state: RootState) => state.prescriptions.loading;
export const selectPrescriptionsError = (state: RootState) => state.prescriptions.error;

export default prescriptionSlice.reducer; 