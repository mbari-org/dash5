// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CheckoutRepoParams {
  repoName: string
  branchName: string
}

export interface CheckoutRepoResponse {
  result: string
}

export const checkoutRepo = async (
  params: CheckoutRepoParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/git/checkout'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as CheckoutRepoResponse
}
