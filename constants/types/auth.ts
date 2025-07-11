export interface RegisterValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'PATIENT' | 'ADMIN' | 'PATIENT';
  id: string;
  isVerified: boolean;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  id: string;
  isVerified: boolean;
  patientProfileId?: string | null; // ID of the associated patient profile
  doctorProfileId?: string | null; // ID of the associated doctor profile
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface VerifyValues {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Payloads for API requests
export interface LoginPayload {
  email: string;
  password: string;
}

// export interface RegisterPayload {
//   firstname: string;
//   lastname: string;
//   email: string;
//   password: string;
//   // `confirmPassword` is for frontend validation only, not sent to backend
// }

export interface VerifyPayload {
  email: string;
  code: string; // Corrected from 'token' to 'code' as per your Postman collection
}

// API Response Structures (based on your Postman responses)
export interface AuthResponseData {
  token: string;
  user: User;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: AuthResponseData; // For login, this will contain token and user
  // For register/verify, `data` might be empty or contain a simple success message
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  code: string; // Changed from 'token' to 'code' based on your Postman collection and code
  confirmPassword?: string
}

// Backend response for forgot password might contain the code or just a success message
export interface ForgotPasswordApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: {
      code: string; // The backend returns the code here
    };
  };
}

export interface ResetPasswordApiResponse {
  success: boolean;
  message: string;
}
