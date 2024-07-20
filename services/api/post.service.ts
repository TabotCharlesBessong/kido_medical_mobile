import { CommentsType, LoginRequestType, LoginResponseType } from '@/types/login.type'
import { publicApiRequest } from '../../lib/hooks/axiosInstance'
import { addTokenToHeaders } from '@/utils/addTokenReq'

export class PostService {
  public async getPosts() {
    return await publicApiRequest().get<CommentsType[]>('/')
  }
}
