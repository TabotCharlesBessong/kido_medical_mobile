export enum ApiRequestStatus {
  IDLE,
  PENDING,
  REJECTED,
  FULFILLED,
}

export type ApiRequestErrorType = {
  response: {
    data: {
      message: string
    }
    status: number
  }
}

export type StoredErrorResponseType = {
  message: string
  code: number
}

// eslint-disable-next-line
export type ApiRequestDataType<DataType = any> = {
  status: ApiRequestStatus
  error?: StoredErrorResponseType
  data?: DataType
}
