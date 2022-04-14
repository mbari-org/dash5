// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPreviewParams {
  vehicle: string
  commandText: string
  schedId: string
  schedDate: string
}

export interface GetPreviewResponse {
  result: string
}

export const getPreview = async (
  params: GetPreviewParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/preview'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetPreviewResponse
}
