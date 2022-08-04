// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetDocumentInstanceResponse } from './getDocumentInstance'

export interface AttachDocumentToDeploymentParams {
  docId: number
  deploymentId: number
}

export type AttachDocumentToDeploymentResponse = GetDocumentInstanceResponse

export const attachDocumentToDeployment = async (
  params: AttachDocumentToDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/deployment'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, undefined, { params, ...config })
  return response.data.result as AttachDocumentToDeploymentResponse
}
