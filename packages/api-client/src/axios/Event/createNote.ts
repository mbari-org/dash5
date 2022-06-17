// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateNoteParams {
  vehicle: string
  note: string
}

export interface CreateNoteResponse {
  result: string
}

export const createNote = async (
  params: CreateNoteParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/events/note'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as CreateNoteResponse
}
