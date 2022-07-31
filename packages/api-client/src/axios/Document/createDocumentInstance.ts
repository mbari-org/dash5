// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetDocumentInstanceResponse } from './getDocumentInstance'
export interface CreateDocumentInstanceParams {
  docId: string
  newName?: string
  text: string
}

export type CreateDocumentInstanceResponse = GetDocumentInstanceResponse

export const createDocumentInstance = async (
  params: CreateDocumentInstanceParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/instance'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data.result as CreateDocumentInstanceResponse
}
