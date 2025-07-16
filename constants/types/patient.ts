export interface PatientProfile {
  id: string; // ID of the patient's profile
  userId: string; // The ID of the associated user account
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number;
  address1: string;
  address2?: string; // Optional
  occupation?: string; // Optional
  phoneNumber: string;
  tribe?: string; // Optional
  religion?: string; // Optional
  createdAt: string;
  updatedAt: string;
  // Add any other patient-specific fields your backend returns
}

// Payload for creating a new patient profile
export interface CreatePatientProfilePayload {
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number;
  address1: string;
  address2?: string;
  occupation?: string;
  phoneNumber: string;
  tribe?: string;
  religion?: string;
}

// API response structure for creating/fetching a patient profile
export interface PatientProfileApiResponse {
  success: boolean;
  message: string;
  data?: PatientProfile; // `data` field might contain the PatientProfile on success
}
