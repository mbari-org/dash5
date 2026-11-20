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

      // XEvent carries a real-time position update from odss2dash.
      // Update the TrackDB position cache directly — no refetch needed.
      if (data.eventName === 'XEvent') {
        const pos = data.payload?.position
        const assetName = data.payload?.assetName
        const assetId = data.payload?.assetId
        if (pos && (assetName || assetId)) {
          // Narrow to position queries only (key[3] === 'positions') to avoid
          // accidentally matching the platform-list query or future cache shapes.
          const allPlatformQueries =
            queryClient.getQueriesData<GetPlatformPositionsResponse>([
              'trackdb',
              'platforms',
            ])
          let matched = false
          for (const [key, existing] of allPlatformQueries) {
            if (key[3] !== 'positions') continue
            // platformId lives at key[2] — available even before the response
            // lands, so we can match by assetId while the initial fetch is pending.
            const queryPlatformId = key[2] as string
            const cap = (key[4] as number | undefined) ?? 20

            // When assetId is present, match by id only — name fallback is
            // skipped to avoid patching the wrong track when names collide or
            // the payload carries an inconsistent assetId/assetName pair.
            const idMatch = assetId && queryPlatformId === assetId
            const nameMatch =
              !assetId &&
              assetName &&
              existing &&
              existing.platformName === assetName
            if (!idMatch && !nameMatch) continue

            matched = true
            const platformId = existing?.platformId ?? queryPlatformId

            // Update the main cache when the response is already available.
            // If the query is still pending (existing is undefined), skip the
            // main cache write — the buffer below is enough for PlatformPath
            // to merge the position once the response arrives.
            if (existing) {
              queryClient.setQueryData<GetPlatformPositionsResponse>(key, {
                ...existing,
                positions: [...existing.positions, pos].slice(-cap),
              })
            }

            // Always write to the XEvent buffer so positions survive both
            // a background HTTP refetch and an in-flight initial fetch.
            // PlatformPath merges the buffer with server data in displayPositions.
            queryClient.setQueryData<PlatformPosition[]>(
              ['trackdb', XEVENT_BUFFER_KEY, platformId],
              (prev = []) => [...(prev ?? []), pos].slice(-cap)
            )
          }

          // No matching cache entry — the platform may not be selected yet or
          // its initial fetch may not have completed. The 10-minute fallback
          // poll in PlatformPath will pick up the position when the component
          // mounts. Avoid invalidateQueries here: in a busy ODSS feed, repeated
          // unmatched XEvents would trigger a refetch storm across all selected
          // platforms.
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
