// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetDocumentInstanceResponse } from './getDocumentInstance'

export interface DetachDocumentToDeploymentParams {
  docId: number
  deploymentId: number
}

export type DetachDocumentToDeploymentResponse = GetDocumentInstanceResponse

export const detachDocumentToDeployment = async (
  params: DetachDocumentToDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/deployment'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(url, { ...config, params })
  return response.data.result as DetachDocumentToDeploymentResponse
}
