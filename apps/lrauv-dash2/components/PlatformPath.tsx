import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Marker, Polyline, Tooltip, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { usePlatformPositions } from '@mbari/api-client'
import { createLogger } from '@mbari/utils'
import { useTick } from '../lib/useTick'

// Dedicated Leaflet pane for ship/platform tracks — sits above the vehicle
// hit-circle layer (overlayPane z-index 400) so ship elements always win
// pointer-event priority when a ship track overlaps a vehicle surfacing fix.
// The <Pane /> must be rendered exactly ONCE (in PlatformPaths.tsx, the parent)
// to avoid "A pane with this name already exists" when multiple ships are shown.
export const PLATFORM_PANE = 'platformsPane'
export const PLATFORM_PANE_Z = 450

const logger = createLogger('PlatformPath')

/** Exported for testing — true only for genuine network timeout errors. */
export const isTimeoutError = (error: unknown): boolean =>
  error instanceof Error && !!error.message?.toLowerCase().includes('timeout')

// How far back to search for position fixes when no explicit window is given.
// 365 days ensures infrequently-updated fixed platforms (e.g. CA offshore
// structures that may not report for months) are still found.
const DEFAULT_LOOKBACK_DAYS = 365

export interface PlatformPathProps {
  platformId: string
  platformName?: string
  platformAbbrev?: string
  color?: string
  iconUrl?: string
  startDate?: string
  endDate?: string
  limitPositions?: number
  refreshIntervalMs?: number
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
  refreshIntervalMs = 5 * 60_000,
}) => {
  const [hovered, setHovered] = useState(false)
  // Track icon load failure so we can show the fallback CircleMarker when
  // the ODSS image is blocked or unavailable. Reset whenever iconUrl changes
  // so a new valid URL gets a fresh attempt.
  const [iconFailed, setIconFailed] = useState(false)
  const handleIconError = useCallback(() => setIconFailed(true), [])
  useEffect(() => {
    setIconFailed(false)
  }, [iconUrl])

  const nowMs = useTick(refreshIntervalMs)

  const queryWindow = useMemo(() => {
    if (startDate && endDate) {
      return { startDate, endDate }
    }
    const end = nowMs
    const start = end - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    return {
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
    }
  }, [startDate, endDate, nowMs])

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
    }
  )

  const displayPositions = useMemo(() => {
    const positions = positionData?.positions
    if (!positions || positions.length === 0) return []

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
  }, [positionData, limitPositions])

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

  if (isLoading) {
    return null
  }

  if (error) {
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
    return null
  }

  const platformColor = color || 'cyan'

  if (!route || route.length === 0) {
    return null
  }

  return (
    <>
      {/* Custom icon at latest position, shown for fixed/infrequently-updated platforms */}
      {platformIcon && route.length > 0 && (
        <Marker position={[route[0][0], route[0][1]]} icon={platformIcon}>
          <Tooltip opacity={0.9}>
            <div className="text-italic">
              <div className="text-bold">{displayName}</div>
              {displayAbbrev && (
                <div className="text-gray-500">({displayAbbrev})</div>
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
            >
              <Tooltip permanent opacity={0.75}>
                <div className="text-italic">
                  <span className="text-bold">{displayName}</span>
                  {displayAbbrev ? (
                    <span className="text-gray-500"> ({displayAbbrev})</span>
                  ) : null}
                  <br />
                  <span className="text-xs text-gray-400">
                    {route[0][0].toFixed(5)}, {route[0][1].toFixed(5)}
                  </span>
                  {displayPositions[0] && (
                    <div className="text-xs text-gray-400">
                      {new Date(displayPositions[0].timeMs).toLocaleString()}
                    </div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          )}

          {/* Historical fix dots — small, semi-transparent, hover-only tooltip.
              Skip index 0 (latest) since the prominent marker above covers it
              for no-icon platforms; skip it too when a custom icon marks it. */}
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
