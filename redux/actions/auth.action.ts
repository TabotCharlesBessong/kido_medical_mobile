import api from '@/utils/api'
import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  forgotPasswordFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  resetPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  signInFailure,
  signInStart,
  signInSuccess,
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from '../slice/auth.slice'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (values: { email: string; password: string }, { dispatch }) => {
    dispatch(signInStart())
    try {
      const response = await api.post('/user/login', values)
      const data = response.data
      if (data.success) {
        dispatch(signInSuccess(data.data))
        await AsyncStorage.setItem('userToken', response.data.data.token)
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user))
      } else {
        dispatch(signInFailure(data.message))
      }
    } catch (error) {
      dispatch(signInFailure((error as TypeError).message))
    }
  },
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (
    values: {
      email: string
      firstname: string
      lastname: string
      password: string
      confirmPassword: string
    },
    { dispatch },
  ) => {
    dispatch(signUpStart())
    try {
      const response = await api.post('/user/register', values)
      const data = response.data
      if (data.success) {
        dispatch(signUpSuccess(data.data))
      } else {
        dispatch(signUpFailure(data.message))
      }
    } catch (error) {
      dispatch(signUpFailure((error as TypeError).message))
    }
  },
)

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (values: { email: string }, { dispatch }) => {
    dispatch(forgotPasswordStart())
    try {
      const response = await api.post('/user/forgot-password', values)
      const data = response.data
      if (data.success) {
        dispatch(forgotPasswordSuccess(data.data))
        await AsyncStorage.setItem('resetCode', data.data.token.code)
      } else {
        dispatch(forgotPasswordFailure(data.message))
      }
    } catch (error) {
      dispatch(forgotPasswordFailure((error as TypeError).message))
    }
  },
)

export const resetPassword = createAsyncThunk(
  '/user/resetPassword',
  async (
    values: {
      password: string
      confirmPassword: string
      code: string
      email: string
    },
    { dispatch },
  ) => {
    dispatch(resetPasswordStart())
    try {
      const storedCode = await AsyncStorage.getItem('resetCode')
      console.log(storedCode)

      if (storedCode !== values.code) {
        resetPasswordFailure('The code you entered is incorrect.')
        return
      }
      const response = await api.post('/user/reset-password', values)
      const data = response.data
      if (data.success) {
        dispatch(resetPasswordSuccess(data.data))
      } else {
        dispatch(resetPasswordFailure(data.message))
      }
    } catch (error) {
      dispatch(resetPasswordFailure((error as TypeError).message))
    }
  },
)
