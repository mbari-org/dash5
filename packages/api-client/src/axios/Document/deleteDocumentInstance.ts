// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteDocumentInstanceParams {
  docInstanceId: string
}

export interface DeleteDocumentInstanceResponse {
  result: string
}

export const deleteDocumentInstance = async (
  params: DeleteDocumentInstanceParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/documents/instance'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as DeleteDocumentInstanceResponse
}
