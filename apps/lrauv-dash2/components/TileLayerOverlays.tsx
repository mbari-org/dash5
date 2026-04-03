import React from 'react'
import { TileLayer, WMSTileLayer } from 'react-leaflet'
import { useTileLayers } from '@mbari/api-client'
import { useSelectedTileLayers } from './SelectedTileLayersContext'

// Keys that are Leaflet display options and must NOT be forwarded as WMS
// query-string parameters.
const LEAFLET_ONLY_KEYS = new Set([
  'opacity',
  'attribution',
  'maxZoom',
  'minZoom',
  'tileSize',
  'tms',
  'zIndex',
  'className',
  'detectRetina',
  'crossOrigin',
  'keepBuffer',
  'updateWhenIdle',
  'updateWhenZooming',
  'updateInterval',
  'maxNativeZoom',
  'minNativeZoom',
  'noWrap',
  'pane',
  'subdomains',
])

// Coerce an option value to a number, returning the fallback if it can't be parsed.
const toNum = (val: unknown, fallback: number): number => {
  const n = Number(val)
  return isFinite(n) ? n : fallback
}

// Normalize WMS transparent: accept boolean true/false or any-case string "true"/"false".
const toTransparent = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() === 'true'
  return true
}

const TileLayerOverlays: React.FC = () => {
  const { data: tileLayers } = useTileLayers()
  const { selectedTileLayers } = useSelectedTileLayers()

  if (!tileLayers || selectedTileLayers.length === 0) return null

  return (
    <>
      {tileLayers
        .filter((t) => selectedTileLayers.includes(t.name))
        .map((t) => {
          const opts = (t.options ?? {}) as Record<string, unknown>
          const opacity = toNum(opts.opacity, 1)

          if (t.wms) {
            const layers = String(opts.layers ?? '')
            const format = String(opts.format ?? 'image/png')
            const transparent = toTransparent(opts.transparent)
            const version = String(opts.version ?? '1.1.1')
            const styles = String(opts.styles ?? '')

            // Collect any remaining keys that are valid WMS params (not Leaflet-only).
            const wmsParams = Object.fromEntries(
              Object.entries(opts)
                .filter(([key]) => !LEAFLET_ONLY_KEYS.has(key))
                .filter(
                  ([key]) =>
                    ![
                      'layers',
                      'format',
                      'transparent',
                      'version',
                      'styles',
                    ].includes(key)
                )
                .map(([key, val]) => [key, String(val)])
            )

            return (
              <WMSTileLayer
                key={t.name}
                url={t.urlTemplate}
                layers={layers}
                format={format}
                transparent={transparent}
                version={version}
                styles={styles}
                opacity={opacity}
                params={
                  Object.keys(wmsParams).length > 0
                    ? { layers, ...wmsParams }
                    : undefined
                }
              />
            )
          }

          return (
            <TileLayer
              key={t.name}
              url={t.urlTemplate}
              opacity={opacity}
              attribution={
                opts.attribution != null ? String(opts.attribution) : undefined
              }
              maxZoom={
                opts.maxZoom != null ? toNum(opts.maxZoom, 18) : undefined
              }
              tileSize={
                opts.tileSize != null ? toNum(opts.tileSize, 256) : undefined
              }
              tms={opts.tms != null ? Boolean(opts.tms) : undefined}
            />
          )
        })}
    </>
  )
}

export default TileLayerOverlays
