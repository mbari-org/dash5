import React, { useMemo, useState } from 'react'
import { Marker, Polyline, Tooltip, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { usePlatformPositions } from '@mbari/api-client'
import { createLogger } from '@mbari/utils'
import { useTick } from '../lib/useTick'

const logger = createLogger('PlatformPath')

// How far back to search for position fixes when no explicit window is given.
// A wide window ensures fixed/infrequently-updated platforms (e.g. CA offshore
// structures) are still found even if their last fix is months old.
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

  if (isLoading) {
    return null
  }

  if (error) {
    logger.warn(`Failed to load positions for platform ${platformId}:`, error)
    return null
  }

  const platformColor = color || 'cyan'

  // Use divIcon with an inline <img> so that onerror can suppress the broken-
  // image placeholder. L.icon() has no error callback and shows a broken link
  // icon when the image fails — which happens when odss.mbari.org blocks direct
  // browser requests (CORS / auth). divIcon renders an img tag whose onerror
  // hides it gracefully, keeping the map clean.
  const platformIcon = iconUrl
    ? L.divIcon({
        className: '',
        html: `<img src="${iconUrl}" width="32" height="32" alt="${displayName}" style="display:block;border:none;background:transparent;" onerror="this.style.display='none'" />`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        tooltipAnchor: [16, 0],
      })
    : null

  if (!route || route.length === 0) {
    if (platformIcon) {
      logger.warn(
        `No positions found for platform ${platformId} within the query window — rendering icon only`
      )
    } else {
      logger.warn(
        `No positions found for platform ${platformId} within the query window — nothing to render`
      )
      return null
    }
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

          {/* Name-label dot at latest position — hidden when a custom icon is shown */}
          {!platformIcon && (
            <CircleMarker
              center={[route[0][0], route[0][1]]}
              radius={1}
              pathOptions={{
                color: platformColor,
                fillColor: platformColor,
                fillOpacity: 1,
                weight: 0,
              }}
            >
              <Tooltip permanent opacity={0.6}>
                <div className="text-italic">
                  <span className="text-bold">{displayName}</span>
                  {displayAbbrev ? (
                    <span className="text-gray-500"> ({displayAbbrev})</span>
                  ) : null}
                </div>
              </Tooltip>
            </CircleMarker>
          )}

          {/* One circle marker per fix with hover tooltip */}
          {route.map((position, index) => {
            const isLatest = index === 0
            const pos = displayPositions[index]
            const timestamp = pos ? new Date(pos.timeMs).toLocaleString() : ''

            return (
              <CircleMarker
                key={`${platformId}-${index}`}
                center={[position[0], position[1]]}
                radius={isLatest ? 6 : 2}
                pathOptions={{
                  color: platformColor,
                  fillColor: platformColor,
                  fillOpacity: 0.2,
                  weight: 3,
                  opacity: 1,
                }}
              >
                <Tooltip opacity={0.9}>
                  <div className="text-italic">
                    <div className="text-bold">{displayName}</div>
                    {displayAbbrev && (
                      <div className="text-gray-500">({displayAbbrev})</div>
                    )}
                  </div>
                  <span>{isLatest ? 'Latest position:' : 'Lat/Lon:'}</span>{' '}
                  {position[0].toFixed(5)}, {position[1].toFixed(5)}
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
