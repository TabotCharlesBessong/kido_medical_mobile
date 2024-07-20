/* eslint-disable */

import { ApiRequestErrorType } from '../types/api.types'
import { InternalServerError } from '../lib/hooks/axiosInstance'

export const getExceptionPayload = (
  ex: unknown,
):
  | ApiRequestErrorType
  | {
      message: string
      code: number
    } => {
  console.log('====================================')
  console.log({ ex })
  console.log('====================================')

  if ((ex as { code: string }).code === 'ERR_NETWORK') {
    return {
      message: 'Network Error. Please check your internet connection and try again.',
      code: -501,
    }
  }

  if (typeof ex !== 'object' || !ex) {
    return InternalServerError
  }

  const typeofException = ex as ApiRequestErrorType

  if (
    ex.hasOwnProperty('response') &&
    typeof typeofException.response.data.message === 'string' &&
    ex.hasOwnProperty('code') &&
    typeof typeofException.response.status === 'number'
  ) {
    return {
      message: typeofException.response.data.message,
      code: typeofException.response.status,
    }
  }

  return InternalServerError
}
