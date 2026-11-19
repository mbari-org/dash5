import { useEffect } from 'react'
import {
  useTethysApiContext,
  GetPlatformPositionsResponse,
} from '@mbari/api-client'
import { useQuery, useQueryClient } from 'react-query'

type SubscriptionEventType =
  | 'VehicleConnected'
  | 'VehiclePingResult'
  | 'XEvent'
  | 'presence'
  | null

export const SUPPORTED_EVENT_TYPES: SubscriptionEventType[] = [
  'VehicleConnected',
  'VehiclePingResult',
  'XEvent',
  'presence',
]

export interface XEventPayload {
  assetId?: string
  assetName?: string
  position?: {
    timeMs: number
    lat: number
    lon: number
  }
  typeName?: string
  color?: string
  iconUrl?: string
}

export interface TethysSubscriptionEvent {
  eventName?: string
  vehicleName?: string
  hostName?: string
  checkedAt?: number
  presence?: string
  reachable?: boolean
  email?: string
  /** Present on XEvent notifications from odss2dash. */
  payload?: XEventPayload
}

export const getTethysSubscriptionQueryKey = (
  eventName: string | undefined,
  vehicleName: string | undefined,
  accountEmail: string | undefined | null
): unknown[] => [eventName, vehicleName, accountEmail].filter(Boolean)

export const useTethysSubscription = () => {
  const { token, profile } = useTethysApiContext()
  const queryClient = useQueryClient()

  // Strip trailing slashes so we don't end up with /ws/ or /ws//.
  const baseUrl = (process.env.NEXT_PUBLIC_WEBSOCKET_URL as string)?.replace(
    /\/+$/,
    ''
  )

  useEffect(() => {
    if (!baseUrl || !token || !profile?.email) {
      return
    }
    const accountEmail = profile.email

    const websocket = new WebSocket(baseUrl)

    websocket.onopen = () => {
      // Send auth as the first frame per the new /ws security protocol
      // (mbari-org/tethysdash#66). The server validates within ~5s and
      // closes the connection on failure; silence means success.
      websocket.send(
        JSON.stringify({
          auth: token,
          tduiv: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
          aem: accountEmail,
        })
      )
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

      // XEvent carries a real-time position update from odss2dash.
      // Update the TrackDB position cache directly — no refetch needed.
      if (data.eventName === 'XEvent') {
        const pos = data.payload?.position
        const assetName = data.payload?.assetName
        if (pos && assetName) {
          const allPlatformQueries =
            queryClient.getQueriesData<GetPlatformPositionsResponse>([
              'trackdb',
              'platforms',
            ])
          for (const [key, existing] of allPlatformQueries) {
            if (!existing || existing.platformName !== assetName) continue
            // Append the new position; display logic in PlatformPath dedupes
            // and limits to limitPositions (default 20).
            queryClient.setQueryData<GetPlatformPositionsResponse>(key, {
              ...existing,
              positions: [...existing.positions, pos],
            })
          }
        }
        return
      }

      const queryKey = getTethysSubscriptionQueryKey(
        data.eventName,
        data.vehicleName,
        accountEmail
      )
      queryClient.setQueryData(queryKey, data)
    }

    return () => {
      websocket.close()
    }
  }, [queryClient, baseUrl, token, profile?.email])
}

/**
 * Websocket payloads cached under the same keys as `useTethysSubscription`. Uses `useQuery`
 * so components re-render when the socket handler calls `setQueryData` (unlike `getQueryData` alone).
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
    () => undefined,
    {
      // This hook is a reactive cache reader for websocket writes; never fetch.
      enabled: false,
      initialData: () =>
        queryClient.getQueryData(queryKey) as
          | TethysSubscriptionEvent
          | undefined,
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }
  )

  return data
}
