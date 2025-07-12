import { User } from "./auth"; // Assuming User is defined in auth.ts
import { PatientProfile } from "./patient"; // Assuming PatientProfile is defined in patient.ts
import { Appointment } from "./appointment"; // Assuming Appointment is defined in appointment.ts

// Interface for a Consultation record
export interface Consultation {
  id: string;
  appointmentId: string;
  appointment?: Appointment; // The appointment this consultation is linked to
  doctorId: string;
  doctor?: User; // Basic user info of the doctor who conducted it
  patientId: string;
  patient?: User; // Basic user info of the patient it's for
  presentingComplaints: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  pastHistory: string;
  createdAt: string;
  updatedAt: string;
}

// Payload for creating a new consultation (used by doctor after an approved appointment)
export interface CreateConsultationPayload {
  appointmentId: string;
  presentingComplaints: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  pastHistory: string;
}

// Payload for updating an existing consultation (used by doctor)
export interface UpdateConsultationPayload {
  consultationId: string;
  payload: Partial<Omit<CreateConsultationPayload, "appointmentId">>; // All fields except appointmentId, and optional
}

// API Response structure for Consultation operations
export interface ConsultationApiResponse {
  success: boolean;
  message: string;
  data?: Consultation | Consultation[]; // Can return a single consultation or an array
}
