import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

// Define the marker interface
export interface Marker {
  id: number
  lat: number
  lng: number
  index: number
  label: string
  iconColor?: string
  visible?: boolean
  savedToLayer?: boolean
}

// GET all markers
export const getMarkers = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/map/layers/markers'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data as Marker[]
}

// Create a new marker
export const createMarker = async (
  marker: Omit<Marker, 'id'>,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/map/layers/markers'

  if (debug) {
    console.debug(`POST ${url}`, marker)
  }

  const response = await instance.post(url, marker, config)
  return response.data as Marker
}

// Update an existing marker
export const updateMarker = async (
  id: string,
  marker: Partial<Marker>,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/map/layers/markers/${id}`

  if (debug) {
    console.debug(`PUT ${url}`, marker)
  }

  const response = await instance.put(url, marker, config)
  return response.data as Marker
}

// Delete a marker
export const deleteMarker = async (
  id: string,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/map/layers/markers/${id}`

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(url, config)
  return response.data
}

// Update multiple markers at once
export const batchUpdateMarkers = async (
  updates: { id: string; changes: Partial<Marker> }[],
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/map/layers/markers/batch'

  if (debug) {
    console.debug(`PATCH ${url}`, updates)
  }

  const response = await instance.patch(url, { updates }, config)
  return response.data as Marker[]
}
