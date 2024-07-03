import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPatientProfile = createAsyncThunk(
  "patientProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://192.168.1.199:5000/api/patient/profile"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPatientProfile = createAsyncThunk(
  "patientProfile/create",
  async (profile: fetchPatientProfile, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://192.168.1.199:5000/api/patient/profile",
        profile
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  "patientProfile/update",
  async (profile: PatientProfile, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://192.168.1.199:5000/api/patient/profile",
        profile
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
