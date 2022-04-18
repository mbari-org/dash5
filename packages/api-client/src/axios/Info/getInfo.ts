// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetInfoParams {}

export interface ExternalAppConfig {
  base: string
  dashui: string
  eventTypeDoc: string
  miscLinksFile: string
  schemaBase: string
  tethysdash: string
  useradmin: string
}

export interface RecaptchaConfig {
  siteKey: string
}

export interface PusherConfig {
  appKey: string
  eventChannel: string
  cluster: string
}

export interface SlackConfig {
  primaryChannel: string
}

export interface WebSocketsConfig {
  useWebsocket: boolean
  maxIdleTimeout: number
}

export interface AppConfig {
  version: string
  external: ExternalAppConfig
  googleApiKey: string
  odss2dashApi: string
  recaptcha: RecaptchaConfig
  slack: SlackConfig
  webSockets: WebSocketsConfig
  pusher: PusherConfig
}

export interface EventKind {
  name: string
  base: string
  subkind?: string
}

export interface GetInfoResponse {
  vehicleNames: string[]
  defaultVehicle: string
  eventTypes: string[]
  eventKinds: EventKind[]
  appConfig: AppConfig
}

export const getInfo = async (
  params: GetInfoParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/info'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data.result as GetInfoResponse
}
