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