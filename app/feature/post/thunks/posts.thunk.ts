import { createAsyncThunk } from '@reduxjs/toolkit'

import { PostService } from '../../../../services/api/post.service'
import { getExceptionPayload } from '../../../../utils/get-exception-payload'
import { ApiRequestErrorType } from '../../../../types/api.types'
import { LoginRequestType } from '@/types/login.type'

const postService = new PostService()

export const PostThunk = createAsyncThunk('/posts', async (_, { rejectWithValue }) => {
  try {
    const response = await postService.getPosts()
    return response?.data
  } catch (ex) {
    return rejectWithValue(getExceptionPayload(ex) as ApiRequestErrorType)
  }
})
