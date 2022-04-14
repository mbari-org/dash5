// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetDocumentsResponse {
  result: string
}

export const getDocuments = async ({
  debug,
  instance = getInstance(),
}: RequestConfig = {}) => {
  const url = '/documents'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url)
  return response.data as GetDocumentsResponse
}
