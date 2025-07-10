export interface DoctorProfile {
  id: string; // The ID of the doctor's profile (distinct from userId in some schemas)
  userId: string; // The ID of the associated user account
  specialization: string;
  fee: number;
  documents: string; // URL to professional documents (e.g., license, certificates)
  verificationStatus: "pending" | "approved" | "rejected"; // Status of KYC verification
  // Add any other doctor-specific fields your backend returns
  createdAt: string;
  updatedAt: string;
}

// Payload for creating a new doctor profile
export interface CreateDoctorProfilePayload {
  specialization: string;
  fee: number; // Assuming backend expects a number
  documents: string; // URL of the uploaded document
}

// API response structure for creating/fetching a doctor profile
export interface DoctorProfileApiResponse {
  success: boolean;
  message: string;
  data?: DoctorProfile; // `data` field might contain the DoctorProfile on success
}
