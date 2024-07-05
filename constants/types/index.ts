export interface DoctorCardProps {
  image: string;
  name: string;
  rating: number;
  location: string;
  experience: number;
  speciality: string;
  language: string;
  fee: number;
  id?:number
}

export interface RegisterDoctorValues {
  name: string;
  location: string;
  experience: number;
  specialization: string;
  language: string;
  fee: number;
  id?: number
  documents: string
}

export interface IUser {
  id: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatient {
  id: string;
  userId: string;
  gender: string;
  age: number;
  address1:string; // city
  address2:string; // quater
  occupation:string;
  phone:number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctor {
  id: string;
  userId: string;
  specialization: string;
  verificationStatus: string;
  documents: string;
  experience:number;
  fee:number;
  language:string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id?: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface PatientProfile {
  employment: string;
  maritalStatus: string;
  age: number;
  gender: string;
  address: string;
  religion: string;
  tribe: string;
  nic: string;
}

export interface IConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Frequency {
  ONCE_A_DAY = "ONCE_A_DAY",
  TWICE_A_DAY = "TWICE_A_DAY",
  THRICE_A_DAY = "THRICE_A_DAY",
}

export interface IMedication {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  duration: number; // in days
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescription {
  id: string;
  consultationId: string;
  instructions?: string;
  investigation?: string;
  medications: IMedication[];
  createdAt: Date;
  updatedAt: Date;
  doctorName: string
  patientName: string
}