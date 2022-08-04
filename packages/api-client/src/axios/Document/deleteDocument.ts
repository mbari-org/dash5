// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteDocumentParams {
  docId: number
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

  await instance.delete(`${url}`, { params, ...config })
  return undefined
}
