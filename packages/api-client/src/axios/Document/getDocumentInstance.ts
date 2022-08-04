// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DocInstanceBrief {
  docInstanceId?: number
  unixTime?: number
  user?: string
}

export interface GetDocumentInstanceParams {
  docInstanceId: string
  deploymentId?: string
}

export interface GetDocumentInstanceResponse {
  docInstanceId: number
  docId: number
  docName: string
  user: string
  email: string
  unixTime: number
  text?: string
  docInstanceBriefs?: DocInstanceBrief[]
}

export const getDocumentInstance = async (
  params: GetDocumentInstanceParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/instance'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetDocumentInstanceResponse
}
