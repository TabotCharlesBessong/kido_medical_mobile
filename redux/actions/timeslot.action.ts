import { TimeSlot } from '@/constants/types'
import api from '@/utils/api'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchTimeSlots = createAsyncThunk(
  'timeSlot/fetchTimeSlots',
  async (doctorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/doctor/${doctorId}/all-time-slot`)

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data.timeSlots
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const createTimeSlot = createAsyncThunk(
  'timeSlot/createTimeSlot',
  async (timeSlotData: TimeSlot, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctor/create-time-slot', timeSlotData)

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data.timeSlot
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const updateTimeSlot = createAsyncThunk(
  'timeSlot/updateTimeSlot',
  async (timeSlotData: TimeSlot, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = timeSlotData
      const response = await api.put(`/timeslots/${id}`, updateData)

      if (response.data.success === false) {
        return rejectWithValue(response.data.message)
      }

      return response.data.timeSlot
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)
