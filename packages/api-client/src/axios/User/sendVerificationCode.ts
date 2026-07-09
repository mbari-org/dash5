import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface SendVerificationCodeParams {
  recipient: string
}

export interface SendVerificationCodeResponse {
  result: {
    sent: boolean
    channel: string
    expiresInSeconds: number
  }
}

export const sendVerificationCode = async (
  params: SendVerificationCodeParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/vc'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as SendVerificationCodeResponse
}
