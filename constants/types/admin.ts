import { User } from "./auth"; // Assuming User interface is in auth.ts
import { DoctorProfile } from "./doctor"; // Import DoctorProfile for linked data

export interface KycVerification {
  id: string; // Unique ID for the KYC verification record
  userId: string; // ID of the user whose KYC is being verified
  user: User; // Full user details associated with this KYC
  type: "DOCTOR_PROFILE" | "IDENTITY"; // Type of verification (e.g., for doctor roles or general identity)
  status: "pending" | "approved" | "rejected"; // Current status of the verification
  documents: string[]; // Array of URLs to submitted documents
  notes?: string; // Optional notes from the admin
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfile; // Optional: If type is DOCTOR_PROFILE, link to the doctor's profile
}

// API response for fetching a list of KYC verifications
export interface FetchKycVerificationsApiResponse {
  success: boolean;
  message: string;
  data: KycVerification[]; // Array of pending KYC requests
}

// Payload for verifying a doctor's profile (used by admin)
export interface VerifyDoctorPayload {
  email: string; // Doctor's email as used in Postman
  status: "approved" | "rejected";
  notes?: string;
}

// Payload for general KYC verification (if applicable, separate from doctor specific)
export interface VerifyKycPayload {
  userId: string; // User ID to verify
  status: "approved" | "rejected";
  notes?: string;
}

// export interface AdminActionApiResponse {
//   success: boolean
//   notes: string
// }

export interface AdminActionApiResponse {
  success: boolean;
  message: string;
  data?: DoctorProfile; // `data` field might contain the DoctorProfile on success
}
