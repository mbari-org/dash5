// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetDocumentInstanceResponse } from './getDocumentInstance'

export interface DetachDocumentToVehicleParams {
  docId: number
  vehicleName: string
}

export type DetachDocumentToVehicleResponse = GetDocumentInstanceResponse

export const detachDocumentToVehicle = async (
  params: DetachDocumentToVehicleParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents/vehicle'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(url, { ...config, params })
  return response.data.result as DetachDocumentToVehicleResponse
}
