// Use scaffold axiosBase to generate the resources imported below.
import { filterBlankAttributes } from '@mbari/utils'
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

interface Revision {
  docInstanceId?: number
  unixTime?: number
}

interface Brief {
  name?: string
  deploymentId?: number
}

interface InstanceBrief extends Revision {
  user?: string
}

export interface GetDocumentsParams {
  docId?: string
  deploymentId?: string
}

export interface GetDocumentsResponse {
  docId?: number
  name?: string
  docType?: string
  latestRevision?: Revision
  deploymentBriefs?: Brief[]
  vehicleNames?: string[]
  docInstanceBriefs?: InstanceBrief[]
}

export const getDocuments = async (
  params: GetDocumentsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/documents'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams(filterBlankAttributes({ ...params }))}`,
    config
  )
  return response.data.result as GetDocumentsResponse[]
}
