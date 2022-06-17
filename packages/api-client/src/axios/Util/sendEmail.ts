// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface SendEmailParams {
  email: string
  subject: string
  text: string
  plainText: string
}

export interface SendEmailResponse {}

export const sendEmail = async (
  params: SendEmailParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/util/email'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as SendEmailResponse
}
