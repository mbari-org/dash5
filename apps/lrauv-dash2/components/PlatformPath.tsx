import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Marker, Polyline, Tooltip, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useQuery } from 'react-query'
import { usePlatformPositions, PlatformPosition } from '@mbari/api-client'
import { createLogger } from '@mbari/utils'
import { PLATFORM_PANE } from '../lib/constants'
import { XEVENT_BUFFER_KEY } from '../lib/useWebSocketListeners'

const logger = createLogger('PlatformPath')

/** Exported for testing — true for Axios timeout errors (message or ECONNABORTED code). */
export const isTimeoutError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  const axiosCode = (error as { code?: string }).code
  return (
    !!error.message?.toLowerCase().includes('timeout') ||
    axiosCode === 'ECONNABORTED'
  )
}

export interface PlatformPathProps {
  platformId: string
  platformName?: string
  platformAbbrev?: string
  color?: string
  iconUrl?: string
  startDate?: string
  endDate?: string
  limitPositions?: number
}

export const PlatformPath: React.FC<PlatformPathProps> = ({
  platformId,
  platformName,
  platformAbbrev,
  color = 'cyan',
  iconUrl,
  startDate,
  endDate,
  limitPositions = 20,
}) => {
  const [hovered, setHovered] = useState(false)
  const [currentPosHovered, setCurrentPosHovered] = useState(false)
  const [iconHovered, setIconHovered] = useState(false)
  // Track icon load failure so we can show the fallback CircleMarker when
  // the ODSS image is blocked or unavailable. Reset whenever iconUrl changes
  // so a new valid URL gets a fresh attempt.
  const [iconFailed, setIconFailed] = useState(false)
  const handleIconError = useCallback(() => setIconFailed(true), [])
  useEffect(() => {
    setIconFailed(false)
  }, [iconUrl])

  // When an explicit date window is provided, use it. Otherwise, omit dates
  // and rely on lastNumberOfFixes only — XEvent WebSocket notifications keep
  // positions current in real-time, so a rotating query key is not needed.
  const queryWindow = useMemo(() => {
    if (startDate && endDate) {
      return { startDate, endDate }
    }
    return {}
  }, [startDate, endDate])

  const {
    data: positionData,
    isLoading,
    error,
  } = usePlatformPositions(
    {
      platformId,
      startDate: queryWindow.startDate,
      endDate: queryWindow.endDate,
      lastNumberOfFixes: limitPositions,
    },
    {
      enabled: !!platformId,
      // Fallback poll when WebSocket drops — XEvent handles real-time updates.
      refetchInterval: 10 * 60 * 1000,
    }
  )

  // Read the per-platform XEvent buffer written by useWebSocketListeners.
  // Using useQuery with enabled: false subscribes to setQueryData writes
  // without triggering any network request.
  const { data: xeventBuffer } = useQuery<PlatformPosition[]>(
    ['trackdb', XEVENT_BUFFER_KEY, platformId],
    () => [],
    { enabled: false, staleTime: Infinity }
  )

  const displayPositions = useMemo(() => {
    const serverPositions = positionData?.positions ?? []

    // Merge XEvent buffer positions that are newer than the server's latest
    // so a background HTTP refetch cannot silently drop in-flight positions.
    const latestServerTimeMs =
      serverPositions.length > 0
        ? Math.max(...serverPositions.map((p) => p.timeMs))
        : 0
    // Use >= so an XEvent fix with the same timestamp but corrected coords
    // is not silently dropped when server timestamp granularity is coarse.
    const freshXEvent = (xeventBuffer ?? []).filter(
      (p) => p.timeMs >= latestServerTimeMs
    )
    const positions = [...freshXEvent, ...serverPositions]
    if (positions.length === 0) return []

    const sorted = [...positions].sort((a, b) => b.timeMs - a.timeMs)
    const seen = new Set<number>()
    const deduped: typeof sorted = []
    for (const p of sorted) {
      if (seen.has(p.timeMs)) continue
      seen.add(p.timeMs)
      deduped.push(p)
      if (deduped.length >= limitPositions) break
    }
    return deduped
  }, [positionData, xeventBuffer, limitPositions])

  const route = useMemo(() => {
    if (displayPositions.length === 0) return []
    return displayPositions.map((pos) => [pos.lat, pos.lon] as [number, number])
  }, [displayPositions])

  const displayName = platformName || positionData?.platformName || platformId
  const displayAbbrev = platformAbbrev || ''

  // Use divIcon with a DOM-constructed img so that:
  // - onerror suppresses broken-image placeholders when ODSS blocks the request
  // - iconUrl/displayName are set via DOM properties (no string interpolation /
  //   XSS risk from inline HTML attributes)
  // - the icon object is memoized to avoid unnecessary Leaflet icon churn
  // Must be declared before any early returns to satisfy Rules of Hooks.
  const platformIcon = useMemo(() => {
    if (!iconUrl || iconFailed) return null

    const container = document.createElement('div')
    container.style.cssText = 'width:44px;height:44px;overflow:hidden;'

    const img = document.createElement('img')
    img.src = iconUrl
    img.alt = displayName
    img.style.cssText =
      'width:44px;height:44px;object-fit:contain;border:none;background:transparent;'
    img.onerror = () => {
      img.style.display = 'none'
      handleIconError()
    }
    container.appendChild(img)

    return L.divIcon({
      className: '',
      html: container,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      tooltipAnchor: [22, 0],
    })
  }, [iconUrl, iconFailed, displayName, handleIconError])

  // Log errors once when they change rather than on every re-render. When
  // keepPreviousData is in effect the component keeps rendering (stale track
  // stays visible), so logging inline would fire on every parent update.
  useEffect(() => {
    if (!error) return
    if (isTimeoutError(error)) {
      // Timeout errors are expected for slow or offline external platforms
      // and are not actionable by the developer — log at debug to reduce noise.
      logger.debug(
        `Failed to load positions for platform ${platformId}:`,
        error
      )
    } else {
      // Auth/config/5xx and other unexpected failures should remain visible.
      logger.warn(`Failed to load positions for platform ${platformId}:`, error)
    }
  }, [error, platformId])

  if (isLoading) {
    return null
  }

  // If keepPreviousData is in effect, positionData still holds the last
  // successful fetch even when error is set — continue rendering the stale
  // track rather than hiding it. Only bail out if there is nothing to show (#837).
  if (error && !positionData?.positions?.length) {
    return null
  }

  const platformColor = color || 'cyan'

  if (!route || route.length === 0) {
    return null
  }

  return (
    <>
      {/* Custom icon at latest position, shown for fixed/infrequently-updated platforms.
          Permanent name label always visible; coords + timestamp appear on hover,
          matching the CircleMarker behaviour for no-icon platforms. */}
      {platformIcon && route.length > 0 && (
        <Marker
          position={[route[0][0], route[0][1]]}
          icon={platformIcon}
          eventHandlers={{
            mouseover: () => setIconHovered(true),
            mouseout: () => setIconHovered(false),
          }}
        >
          <Tooltip permanent opacity={0.75}>
            <div className="text-italic">
              <span className="text-bold">{displayName}</span>
              {displayAbbrev && (
                <span className="text-gray-500"> ({displayAbbrev})</span>
              )}
              {iconHovered && (
                <>
                  <br />
                  <span className="text-xs text-gray-400">
                    {route[0][0].toFixed(5)}, {route[0][1].toFixed(5)}
                  </span>
                  {displayPositions[0] && (
                    <div className="text-xs text-gray-400">
                      {new Date(displayPositions[0].timeMs).toLocaleString()}
                    </div>
                  )}
                </>
              )}
            </div>
          </Tooltip>
        </Marker>
      )}
      {route.length > 0 && (
        <>
          <Polyline
            pane={PLATFORM_PANE}
            pathOptions={{
              color: platformColor,
              weight: 3,
              opacity: hovered ? 0.8 : 0.6,
            }}
            positions={route}
            eventHandlers={{
              mouseover: () => setHovered(true),
              mouseout: () => setHovered(false),
            }}
          >
            <Tooltip sticky opacity={0.6}>
              <span className="text-bold text-italic">{displayName}</span>
              {displayAbbrev && (
                <span className="text-italic text-gray-500">
                  {' '}
                  ({displayAbbrev})
                </span>
              )}
              <br />
              <span className="text-faded">
                Positions displayed: {route.length}
              </span>
            </Tooltip>
          </Polyline>

          {/* Prominent current-position marker — solid filled circle with white
              outline so it reads clearly against both the track line and the
              basemap. Also shown as fallback when the custom icon image fails
              to load (e.g. ODSS blocks the request). */}
          {/* platformIcon is already null when iconFailed — !platformIcon covers both cases */}
          {!platformIcon && (
            <CircleMarker
              center={[route[0][0], route[0][1]]}
              pane={PLATFORM_PANE}
              radius={8}
              pathOptions={{
                color: 'white',
                fillColor: platformColor,
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                mouseover: () => setCurrentPosHovered(true),
                mouseout: () => setCurrentPosHovered(false),
              }}
            >
              {/* Permanent tooltip shows name label only — coords/timestamp
                  are added on hover to avoid clutter with multiple platforms. */}
              <Tooltip permanent opacity={0.75}>
                <div className="text-italic">
                  <span className="text-bold">{displayName}</span>
                  {displayAbbrev ? (
                    <span className="text-gray-500"> ({displayAbbrev})</span>
                  ) : null}
                  {currentPosHovered && (
                    <>
                      <br />
                      <span className="text-xs text-gray-400">
                        {route[0][0].toFixed(5)}, {route[0][1].toFixed(5)}
                      </span>
                      {displayPositions[0] && (
                        <div className="text-xs text-gray-400">
                          {new Date(
                            displayPositions[0].timeMs
                          ).toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          )}

          {/* Historical fix dots — small, semi-transparent, hover-only tooltip.
              Index 0 (latest position) is always skipped here; it is covered
              by the prominent CircleMarker above (no-icon) or the Marker icon. */}
          {route.map((position, index) => {
            if (index === 0) return null
            const pos = displayPositions[index]
            const timestamp = pos ? new Date(pos.timeMs).toLocaleString() : ''

            return (
              <CircleMarker
                key={`${platformId}-${index}`}
                center={[position[0], position[1]]}
                pane={PLATFORM_PANE}
                radius={2}
                pathOptions={{
                  color: platformColor,
                  fillColor: platformColor,
                  fillOpacity: 0.5,
                  weight: 1,
                  opacity: 0.7,
                }}
              >
                <Tooltip opacity={0.9}>
                  <div className="text-italic">
                    <div className="text-bold">{displayName}</div>
                    {displayAbbrev && (
                      <div className="text-gray-500">({displayAbbrev})</div>
                    )}
                  </div>
                  <span>Lat/Lon:</span> {position[0].toFixed(5)},{' '}
                  {position[1].toFixed(5)}
                  <br />
                  {timestamp && (
                    <div className="text-sm text-gray-400">{timestamp}</div>
                  )}
                </Tooltip>
              </CircleMarker>
            )
          })}
        </>
      )}
    </>
  )
}
