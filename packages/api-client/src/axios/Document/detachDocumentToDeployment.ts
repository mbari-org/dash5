// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DetachDocumentToDeploymentParams {
  docId: string
  deploymentId: string
}

export interface DetachDocumentToDeploymentResponse {
  result: string
}

export const detachDocumentToDeployment = async (
  params: DetachDocumentToDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/deployment'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as DetachDocumentToDeploymentResponse
}
