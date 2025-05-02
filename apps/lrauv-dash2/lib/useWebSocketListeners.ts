import { useEffect, useState } from 'react'
import { useTethysApiContext } from '@mbari/api-client'
import { useQueryClient } from 'react-query'

type SubscriptionEventType =
  | 'VehicleConnected'
  | 'VehiclePingResult'
  | 'presence'
  | null

export const SUPPORTED_EVENT_TYPES: SubscriptionEventType[] = [
  'VehicleConnected',
  'VehiclePingResult',
  'presence',
]

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
      if (
        !SUPPORTED_EVENT_TYPES.includes(
          (data.eventName ?? null) as SubscriptionEventType
        )
      ) {
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
