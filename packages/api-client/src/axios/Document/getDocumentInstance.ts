// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetDocumentInstanceParams {
  docInstanceId: string
}

export interface GetDocumentInstanceResponse {
  result: string
}

export const getDocumentInstance = async (
  params: GetDocumentInstanceParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/instance'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetDocumentInstanceResponse
}
