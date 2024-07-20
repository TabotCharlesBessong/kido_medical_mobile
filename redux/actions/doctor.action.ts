import { RegisterDoctorValues } from '@/constants/types'
import api from '@/utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const registerDoctor = createAsyncThunk(
  'doctor/registerDoctor',
  async (values: RegisterDoctorValues, { rejectWithValue }) => {
    try {
      const userData = await AsyncStorage.getItem('userData')
      if (!userData) {
        return rejectWithValue('No user data found, please log in again.')
      }

      const user = JSON.parse(userData)

      const requestBody = {
        ...values,
        user: {
          userId: user.id,
        },
      }

      const response = await api.post('/doctor/create', requestBody)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  },
)

export const updateDoctor = createAsyncThunk(
  'doctor/updateDoctor',
  async (doctorData: any, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = doctorData
      const response = await api.put(`/doctor/${id}`, updateData)

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const fetchDoctor = createAsyncThunk(
  'doctor/fetchDoctor',
  async (doctorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/doctor/${doctorId}`)

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctor')

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)
