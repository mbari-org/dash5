import React from 'react'
import { TileLayer, WMSTileLayer } from 'react-leaflet'
import L from 'leaflet'
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
  // srs is handled via the crs prop below — don't forward as a raw WMS param
  // or it will conflict with the CRS/SRS Leaflet computes from the map's CRS.
  'srs',
])

// Map an SRS code from the API options to a Leaflet CRS object so that
// Leaflet computes bounding-box coordinates in the correct coordinate system.
const getCRS = (srs: unknown): L.CRS | undefined => {
  if (typeof srs !== 'string') return undefined
  const code = srs.toUpperCase().replace('EPSG:', 'EPSG:')
  if (code === 'EPSG:4326' || code === 'CRS:84') return L.CRS.EPSG4326
  if (code === 'EPSG:3857' || code === 'EPSG:900913') return L.CRS.EPSG3857
  if (code === 'EPSG:3395') return L.CRS.EPSG3395
  return undefined
}

// Coerce an option value to a number, returning the fallback if it can't be
// parsed or falls below an optional minimum (e.g. tileSize must be > 0).
const toNum = (val: unknown, fallback: number, min = -Infinity): number => {
  const n = Number(val)
  return isFinite(n) && n >= min ? n : fallback
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
          // Skip layers with no URL — a missing/empty urlTemplate would cause
          // Leaflet to behave unpredictably.
          if (!t.urlTemplate || t.urlTemplate.trim() === '') {
            console.warn(
              `[TileLayerOverlays] Skipping "${t.name}": empty urlTemplate`
            )
            return null
          }

          const opts = (t.options ?? {}) as Record<string, unknown>
          const opacity = toNum(opts.opacity, 1)
          // Always resolve to a positive integer; never pass 0 to Leaflet
          // because tileSize=0 causes the "infinite tiles" error.
          const tileSize = toNum(opts.tileSize ?? 256, 256, 1)

          // Strip any trailing `?` from the URL — Leaflet appends its own
          // query string, so a trailing `?` results in a `?&service=WMS...`
          // double-separator in the final request URL.
          const url = t.urlTemplate.replace(/\?$/, '')

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
                    // These are either handled as explicit top-level props above
                    // or generated automatically by Leaflet — exclude from params
                    // to avoid duplicates in the WMS request URL.
                    ![
                      'layers',
                      'format',
                      'transparent',
                      'version',
                      'styles',
                      'service',
                      'request',
                      'width',
                      'height',
                    ].includes(key)
                )
                .map(([key, val]) => [key, String(val)])
            )

            const crs = getCRS(opts.srs)

            return (
              <WMSTileLayer
                key={t.name}
                url={url}
                layers={layers}
                format={format}
                transparent={transparent}
                version={version}
                styles={styles}
                opacity={opacity}
                crs={crs}
                attribution={
                  opts.attribution != null
                    ? String(opts.attribution)
                    : undefined
                }
                maxZoom={
                  opts.maxZoom != null ? toNum(opts.maxZoom, 18) : undefined
                }
                minZoom={
                  opts.minZoom != null ? toNum(opts.minZoom, 0) : undefined
                }
                tileSize={tileSize}
                zIndex={opts.zIndex != null ? toNum(opts.zIndex, 1) : undefined}
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
              url={url}
              opacity={opacity}
              attribution={
                opts.attribution != null ? String(opts.attribution) : undefined
              }
              maxZoom={
                opts.maxZoom != null ? toNum(opts.maxZoom, 18) : undefined
              }
              tileSize={tileSize}
              tms={opts.tms != null ? Boolean(opts.tms) : undefined}
            />
          )
        })}
    </>
  )
}

export default TileLayerOverlays
