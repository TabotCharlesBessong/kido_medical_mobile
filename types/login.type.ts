

export interface LoginRequestType {
    email: string;
    password: string;
}


export interface LoginResponseType {
  status: boolean;
  message: string;
  data: Data;
}

export interface Data {
  user: UserTypes;
  token: string;
}

export interface UserTypes {
  id: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isEmailVerified: string;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface CommentsType {
  userId: number;
  id: number;
  title: string;
  body: string;
}
