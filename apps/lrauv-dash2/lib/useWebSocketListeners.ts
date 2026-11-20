import { useEffect } from 'react'
import {
  useTethysApiContext,
  GetPlatformPositionsResponse,
  PlatformPosition,
} from '@mbari/api-client'
import { useQuery, useQueryClient } from 'react-query'

/** Cache key prefix for the per-platform XEvent position buffer. */
export const XEVENT_BUFFER_KEY = 'xevent-buffer'

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

      // XEvent: update TrackDB position cache directly.
      if (data.eventName === 'XEvent') {
        const pos = data.payload?.position
        const assetName = data.payload?.assetName
        const assetId = data.payload?.assetId
        if (pos && (assetName || assetId)) {
          // Narrow to position queries only.
          const allPlatformQueries =
            queryClient.getQueriesData<GetPlatformPositionsResponse>([
              'trackdb',
              'platforms',
            ])
          let matched = false
          for (const [key, existing] of allPlatformQueries) {
            if (key[3] !== 'positions') continue
            // key[2] is platformId — available before response lands.
            const queryPlatformId = key[2] as string
            const cap = (key[4] as number | undefined) ?? 20

            // Match by id when present; name fallback only when assetId is absent.
            const idMatch = assetId && queryPlatformId === assetId
            const nameMatch =
              !assetId &&
              assetName &&
              existing &&
              existing.platformName === assetName
            if (!idMatch && !nameMatch) continue

            matched = true
            const platformId = existing?.platformId ?? queryPlatformId

            // Skip main cache write while pending — buffer covers it.
            if (existing) {
              queryClient.setQueryData<GetPlatformPositionsResponse>(key, {
                ...existing,
                positions: [...existing.positions, pos].slice(-cap),
              })
            }

            // Always write buffer — survives HTTP refetch and pending initial fetch.
            queryClient.setQueryData<PlatformPosition[]>(
              ['trackdb', XEVENT_BUFFER_KEY, platformId],
              (prev = []) => [...(prev ?? []), pos].slice(-cap)
            )
          }

          // No match — not yet selected. Fallback poll handles it; no invalidate to avoid refetch storm.
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
