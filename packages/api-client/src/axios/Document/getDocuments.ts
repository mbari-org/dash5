// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetDocumentsParams {
  docId?: string
}
export interface GetDocumentsResponse {
  result: string
}

export const getDocuments = async (
  params: GetDocumentsParams = {},
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetDocumentsResponse
}
