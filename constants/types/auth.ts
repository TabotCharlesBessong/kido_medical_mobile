export interface RegisterValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
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
