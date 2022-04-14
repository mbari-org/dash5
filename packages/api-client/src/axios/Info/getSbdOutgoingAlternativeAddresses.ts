// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetSbdOutgoingAlternativeAddressesParams {}

export interface GetSbdOutgoingAlternativeAddressesResponse {
  result: string
}

export const getSbdOutgoingAlternativeAddresses = async (
  params: GetSbdOutgoingAlternativeAddressesParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/info/sbd/destAddresses'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as GetSbdOutgoingAlternativeAddressesResponse
}
