import { User } from "./auth"; // Assuming User is defined in auth.ts
import { Consultation } from "./consultation";
import { DoctorProfile } from "./doctor"; // Assuming DoctorProfile is defined in doctor.ts
import { PatientProfile } from "./patient"; // Assuming PatientProfile is defined in patient.ts

// Enum for medication frequency
export type MedicationFrequency =
  | "ONCE_A_DAY"
  | "TWICE_A_DAY"
  | "THRICE_A_DAY"
  | "FOUR_TIMES_A_DAY"
  | "AS_NEEDED";

// Interface for a single medication within a prescription
export interface Medication {
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  duration: number; // Duration in days
}

// Interface for a Prescription record
export interface Prescription {
  id: string;
  consultationId: string;
  consultation?: Consultation; // Populated consultation object
  doctorId: string;
  doctor?: User; // Basic user info of the doctor who issued it
  patientId: string;
  patient?: User; // Basic user info of the patient it's for
  instructions: string; // General instructions for the patient
  investigation: string; // Any required further investigations
  medications: Medication[]; // Array of prescribed medications
  createdAt: string;
  updatedAt: string;
}

// Payload for creating a new prescription
export interface CreatePrescriptionPayload {
  consultationId: string;
  instructions: string;
  investigation: string;
  medications: Medication[];
}

// Payload for updating a prescription (if you add an update feature)
export interface UpdatePrescriptionPayload {
  prescriptionId: string;
  payload: Partial<CreatePrescriptionPayload>; // Allow partial updates
}

// API Response structure for Prescription operations
export interface PrescriptionApiResponse {
  success: boolean;
  message: string;
  data?: Prescription | Prescription[]; // Can return a single prescription or an array
}
