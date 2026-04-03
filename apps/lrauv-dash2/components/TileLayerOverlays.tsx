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

const TileLayerOverlays: React.FC = () => {
  const { data: tileLayers } = useTileLayers()
  const { selectedTileLayers } = useSelectedTileLayers()

  if (!tileLayers || selectedTileLayers.length === 0) return null

  return (
    <>
      {tileLayers
        .filter((t) => selectedTileLayers.includes(t.name))
        .map((t) => {
          const opacity = (t.options?.opacity as number) ?? 1

          if (t.wms) {
            const opts = (t.options ?? {}) as Record<string, string>
            const {
              layers = '',
              format = 'image/png',
              transparent = 'true',
              version = '1.1.1',
              styles = '',
              ...rest
            } = opts

            // Filter out Leaflet display-only keys so they aren't sent as
            // WMS query parameters (which would break server caching).
            const wmsParams = Object.fromEntries(
              Object.entries(rest).filter(
                ([key]) => !LEAFLET_ONLY_KEYS.has(key)
              )
            )

            return (
              <WMSTileLayer
                key={t.name}
                url={t.urlTemplate}
                layers={layers}
                format={format}
                transparent={transparent === 'true'}
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
              attribution={t.options?.attribution as string | undefined}
              maxZoom={t.options?.maxZoom as number | undefined}
              tileSize={t.options?.tileSize as number | undefined}
              tms={t.options?.tms as boolean | undefined}
            />
          )
        })}
    </>
  )
}

export default TileLayerOverlays
