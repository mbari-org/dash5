import React from 'react'
import { TileLayer, WMSTileLayer } from 'react-leaflet'
import { useTileLayers } from '@mbari/api-client'
import { useSelectedTileLayers } from './SelectedTileLayersContext'

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
                  Object.keys(rest).length > 0 ? { layers, ...rest } : undefined
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
