import React, { useMemo, useState } from 'react'
import { Polyline, Tooltip, CircleMarker } from 'react-leaflet'
import { usePlatformPositions } from '@mbari/api-client'
import { createLogger } from '@mbari/utils'
import { useTick } from '../lib/useTick'

const logger = createLogger('PlatformPath')

export interface PlatformPathProps {
  platformId: string
  platformName?: string
  platformAbbrev?: string
  color?: string
  startDate?: string
  endDate?: string
  windowDays?: number
  limitPositions?: number
  refreshIntervalMs?: number
}

export const PlatformPath: React.FC<PlatformPathProps> = ({
  platformId,
  platformName,
  platformAbbrev,
  color = 'cyan',
  startDate,
  endDate,
  windowDays = 1,
  limitPositions = 20,
  refreshIntervalMs = 5 * 60_000,
}) => {
  const [hovered, setHovered] = useState(false)

  const nowMs = useTick(refreshIntervalMs)

  // dash4-style TrackDB query window:
  // - Always provide BOTH startDate and endDate
  // - Explicit startDate+endDate (e.g. a fixed historical range) take precedence
  // - Otherwise use a rolling window of windowDays that refreshes via useTick
  const queryWindow = useMemo(() => {
    const hasExplicitWindow = Boolean(startDate && endDate)
    if (hasExplicitWindow) {
      return { startDate: startDate as string, endDate: endDate as string }
    }

    const end = nowMs
    const start = end - windowDays * 24 * 60 * 60 * 1000
    return {
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
    }
  }, [startDate, endDate, windowDays, nowMs])

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

    const sorted = [...positions]
      .filter(
        (p) => p.lat != null && p.lon != null && !isNaN(p.lat) && !isNaN(p.lon)
      )
      .sort((a, b) => b.timeMs - a.timeMs)
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

  if (!route || route.length === 0) {
    return null
  }

  const platformColor = color || 'cyan'

  return (
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

      {/* Dash4-style "name label" dot: tiny marker at latest position */}
      {route.length > 0 && (
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

      {/* Dash4-style point markers: one marker per fix, tooltip on hover */}
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
  )
}
