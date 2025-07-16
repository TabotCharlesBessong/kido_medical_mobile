import { User } from "./auth";
import { CallRecord } from "./call";
import { Timeslot } from "./timeslot";

export type AppointmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Appointment {
  id: string;
  date: string; // Original date of appointment, e.g., "5/30/2025"
  reason: string;
  patientId: string;
  patient?: User; // Full user object of the patient
  doctorId: string;
  doctor?: User; // Full user object of the doctor
  timeslotId: string;
  timeslot?: Timeslot; // Full timeslot object
  status: AppointmentStatus;
  callRecordId?: string; // NEW: ID of the backend's CallRecord associated with this appointment
  callRecord?: CallRecord; // NEW: Populated CallRecord if available
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentPayload {
  date: string; // "M/dd/yyyy" string
  reason: string;
  doctorId: string;
  timeslotId: string;
}

export interface ApproveAppointmentPayload {
  appointmentId: string;
  status: AppointmentStatus; // 'APPROVED' or 'REJECTED'
}

export interface AppointmentApiResponse {
  success: boolean;
  message: string;
  data?: Appointment | Appointment[]; // Can return a single or array of appointments
}
