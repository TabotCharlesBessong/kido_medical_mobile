import { LoginRequestType, LoginResponseType } from "@/types/login.type";
import { publicApiRequest } from "../../lib/hooks/axiosInstance";
import { addTokenToHeaders } from "@/utils/addTokenReq";

export class AuthService {
  public async loginUser(data: LoginRequestType) {
    return await publicApiRequest().post<LoginResponseType>(
      "/user/login",
      data
    );
  }
  public async getDoctorDetails(data: LoginRequestType , token: string) {
    return await publicApiRequest().get<LoginResponseType>(
      "/doctor/details",
      addTokenToHeaders(token)
    );
  }
}
