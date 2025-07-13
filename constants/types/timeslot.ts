import { DoctorProfile } from "./doctor"; // Assuming doctor types are defined
import { User } from "./auth"; // Assuming user types are defined

export interface Timeslot {
  id: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  doctorId: string;
  doctor?: User; // Populate with basic user info of the doctor
  isBooked: boolean; // True if an appointment is booked for this slot
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeslotPayload {
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
}

export interface TimeslotApiResponse {
  success: boolean;
  message: string;
  data?: Timeslot | Timeslot[]; // Can return a single timeslot or an array
}

// For fetching timeslots for a specific doctor
export interface FetchTimeslotsForDoctorApiResponse {
  success: boolean;
  message: string;
  data: Timeslot[];
}
