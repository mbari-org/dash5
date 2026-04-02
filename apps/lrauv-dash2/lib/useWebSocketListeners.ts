import { useEffect } from 'react'
import { useTethysApiContext } from '@mbari/api-client'
import { useQuery, useQueryClient } from 'react-query'

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

export const getTethysSubscriptionQueryKey = (
  eventName: string | undefined,
  vehicleName: string | undefined,
  accountEmail: string | undefined | null
): unknown[] => [eventName, vehicleName, accountEmail].filter(Boolean)

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
    const accountEmail = profile?.email
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
      const queryKey = getTethysSubscriptionQueryKey(
        data.eventName,
        data.vehicleName,
        accountEmail
      )
      queryClient.invalidateQueries({ queryKey })
      queryClient.setQueryData(queryKey, data)
    }

    return () => {
      websocket.close()
    }
  }, [queryClient, url, profile?.email])
}

/**
 * Subscribes to websocket-backed cache updates (same key as `useTethysSubscription`).
 * Plain `getQueryData` does not re-render when `setQueryData` runs.
 */
export const useTethysSubscriptionEvent = (
  eventType: SubscriptionEventType,
  scope: string
): TethysSubscriptionEvent | undefined => {
  const { profile } = useTethysApiContext()
  const queryClient = useQueryClient()
  const subscribed = Boolean(eventType && scope)
  const queryKey = subscribed
    ? getTethysSubscriptionQueryKey(eventType as string, scope, profile?.email)
    : (['_tethys_subscription', 'disabled'] as const)

  const { data } = useQuery<TethysSubscriptionEvent | undefined>(
    queryKey,
    () =>
      Promise.resolve(
        queryClient.getQueryData(queryKey) as
          | TethysSubscriptionEvent
          | undefined
      ),
    {
      enabled: subscribed,
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }
  )

  return data
}
