// services/authService.ts
import { baseUrl } from "@/utils/constants";
import axios from "axios";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const register = async (payload: any) => {
  const res = await api.post("/auth/register", payload);
  return res.data.data;
};

const verify = async (otp: string) => {
  const res = await api.post("/auth/verify", { otp });
  return res.data.data;
};

const login = async (payload: any) => {
  const res = await api.post("/auth/login", payload);
  return res.data.data;
};

export default { register, verify, login };
