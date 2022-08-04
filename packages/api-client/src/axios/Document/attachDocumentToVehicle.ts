// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetDocumentInstanceResponse } from './getDocumentInstance'

export interface AttachDocumentToVehicleParams {
  docId: number
  vehicleName: string
}

export type AttachDocumentToVehicleResponse = GetDocumentInstanceResponse

export const attachDocumentToVehicle = async (
  params: AttachDocumentToVehicleParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/vehicle'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, undefined, { ...config, params })
  return response.data.result as AttachDocumentToVehicleResponse
}
