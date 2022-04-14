// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DetachDocumentToVehicleParams {
  docId: string
  vehicleName: string
}

export interface DetachDocumentToVehicleResponse {
  result: string
}

export const detachDocumentToVehicle = async (
  params: DetachDocumentToVehicleParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/documents/vehicle'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as DetachDocumentToVehicleResponse
}
