/* eslint-disable */

import { createSlice } from '@reduxjs/toolkit'

import { loginUserThunk } from '../thunks/auth.thunk'
import { ApiRequestStatus, StoredErrorResponseType } from '@/types/api.types'
import { LocalStorage } from '../../../../services/storage/local-storage.service'
import { UserTypes } from '@/types/login.type'

type InitialStateTypes = {
  user: UserTypes
  accessToken: string | null
  status: ApiRequestStatus
  message: string
}

const initialState: InitialStateTypes = {
  user: {} as UserTypes,
  status: ApiRequestStatus.IDLE,
  accessToken: '',
  message: '',
}

const loginSlice = createSlice({
  name: 'loginSlice',
  initialState: initialState,
  reducers: {
    resetLoginState: state => {
      state.status = ApiRequestStatus.IDLE
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUserThunk.pending, (state, _action) => {
        ;(state.status = ApiRequestStatus.PENDING),
          (state.accessToken = ''),
          (state.user = {} as UserTypes)
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        ;(state.status = ApiRequestStatus.FULFILLED),
          (state.accessToken = action.payload.data.token),
          (state.user = action.payload.data.user)
        console.log(action.payload)

        LocalStorage.storeLoginData(action.payload)
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.status = ApiRequestStatus.REJECTED
        state.accessToken = ''
        state.user = {} as UserTypes
        state.message = (action.payload as StoredErrorResponseType).message
      })
  },
})

export const { resetLoginState } = loginSlice.actions
export default loginSlice.reducer
