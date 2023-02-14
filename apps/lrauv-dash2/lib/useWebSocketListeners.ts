import { useEffect, useState } from 'react'
import { useTethysApiContext } from '@mbari/api-client'
import { QueryClient, useQueryClient } from 'react-query'

type SubscriptionEventType =
  | 'VehicleConnected'
  | 'VehiclePingResult'
  | 'presence'

export const SUPPORTED_EVENT_TYPES: SubscriptionEventType[] = [
  'VehicleConnected',
  'VehiclePingResult',
  'presence',
]

export const useWebsocketListeners = () => {
  const { token, profile } = useTethysApiContext()
  const webSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL as string

  const [data, setData] = useState({})
  const [ws, setWS] = useState<WebSocket | null>(null)
  useEffect(() => {
    if (webSocketUrl.length === 0 || ws || !token || !profile) {
      return
    }
    const url = `${webSocketUrl}/${token}?tduiv=4.30.1&aem=${profile?.email}`
    console.log('Opening websocket url at: ', url)
    const newWS = new WebSocket(url)
    newWS.onerror = (err) => console.error(err)
    newWS.onopen = () => setWS(newWS)
    newWS.onmessage = (msg) => setData(JSON.parse(msg.data))
  }, [webSocketUrl, ws, setWS, setData, token, profile])

  console.log('data', data)
  return data
}

export interface TethysSubscriptionEvent {
  eventName?: string
  vehicleName?: string
  hostName?: string
  checkedAt?: number
  presence?: string
  reachable?: boolean
  email?: string
}

export const useTethysSubscription = () => {
  const { token, profile } = useTethysApiContext()
  const queryClient = useQueryClient()

  const url =
    profile?.email &&
    token &&
    `${process.env.NEXT_PUBLIC_WEBSOCKET_URL as string}/${token}?aem=${
      profile?.email
    }`

  useEffect(() => {
    if (!url) {
      return
    }
    const websocket = new WebSocket(url)
    websocket.onopen = () => {
      console.log('connected')
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as TethysSubscriptionEvent
      if (!SUPPORTED_EVENT_TYPES.includes(data.eventName ?? '')) {
        console.log('Unsupported event type: ', data.eventName)
        return
      }
      const queryKey = [data.eventName, data.vehicleName, data.email].filter(
        (i) => i
      )
      queryClient.invalidateQueries({ queryKey })
      queryClient.setQueryData(queryKey, data)
    }

    return () => {
      websocket.close()
    }
  }, [queryClient, url])
}

export const useTethysSubscriptionEvent = (
  eventType: SubscriptionEventType,
  scope: string
) => {
  const queryClient = useQueryClient()
  return queryClient.getQueryData([eventType, scope]) as TethysSubscriptionEvent
}
