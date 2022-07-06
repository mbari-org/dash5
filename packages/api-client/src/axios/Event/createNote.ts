// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { filterBlankAttributes } from '@mbari/utils'
export interface CreateNoteParams {
  vehicle: string
  note: string
  bug?: boolean
}

export interface CreateNoteResponse {
  date: string
  status: string
  vehicle: string
  sentBy: string
}

export const createNote = async (
  params: CreateNoteParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/events/note'

  const completeUrl = `${url}?${new URLSearchParams(
    filterBlankAttributes({
      note: params.note,
      vehicle: params.vehicle,
      bug: params.bug ? 'y' : 'n',
    })
  )}`

  if (debug) {
    console.debug(`POST ${completeUrl}`)
  }

  const response = await instance.post(completeUrl, undefined, config)
  return response.data.result as CreateNoteResponse
}
