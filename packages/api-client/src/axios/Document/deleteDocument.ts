// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteDocumentParams {
  docId: string
}

export interface DeleteDocumentResponse {
  result: string
}

export const deleteDocument = async (
  params: DeleteDocumentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as DeleteDocumentResponse
}
