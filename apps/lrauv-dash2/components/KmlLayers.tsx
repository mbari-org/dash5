import React, { useEffect, useState } from 'react'
import { GeoJSON, Tooltip } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import { kml as kmlToGeoJSON } from '@tmcw/togeojson'
import { createLogger } from '@mbari/utils'
import {
  useKmlLayers,
  useTethysApiContext,
  getKmlLayer,
} from '@mbari/api-client'
import { useSelectedKmlLayers } from './SelectedKmlLayersContext'

const logger = createLogger('KmlLayers')

interface KmlGeoJSON {
  name: string
  geojson: GeoJsonObject | null
}

const KmlLayers: React.FC = () => {
  const { data: kmlLayerList } = useKmlLayers()
  const { selectedKmlLayers } = useSelectedKmlLayers()
  const { axiosInstance } = useTethysApiContext()
  const [kmlData, setKmlData] = useState<KmlGeoJSON[]>([])

  useEffect(() => {
    if (!kmlLayerList || selectedKmlLayers.length === 0) {
      setKmlData([])
      return
    }

    const toFetch = kmlLayerList.filter(
      (k) =>
        selectedKmlLayers.includes(k.name) &&
        k.path.toLowerCase().endsWith('.kml')
    )

    let cancelled = false

    Promise.all(
      toFetch.map(async (k) => {
        try {
          const rawKml = await getKmlLayer(
            { path: k.path },
            { instance: axiosInstance }
          )
          const parser = new DOMParser()
          const kmlDoc = parser.parseFromString(rawKml, 'text/xml')
          if (kmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error(`Failed to parse KML for layer "${k.name}"`)
          }
          const geojson = kmlToGeoJSON(kmlDoc) as GeoJsonObject
          return { name: k.name, geojson }
        } catch (error) {
          logger.error(
            `Failed to load KML layer "${k.name}" from path "${k.path}"`,
            error
          )
          return { name: k.name, geojson: null }
        }
      })
    ).then((results) => {
      if (!cancelled) setKmlData(results)
    })

    return () => {
      cancelled = true
    }
  }, [selectedKmlLayers, kmlLayerList, axiosInstance])

  if (kmlData.length === 0) return null

  return (
    <>
      {kmlData
        .filter((k) => k.geojson !== null)
        .map((k) => (
          <GeoJSON
            key={k.name}
            data={k.geojson!}
            style={() => ({
              color: '#9333ea',
              weight: 2,
              fillColor: '#9333ea',
              fillOpacity: 0.15,
            })}
          >
            <Tooltip sticky>{k.name}</Tooltip>
          </GeoJSON>
        ))}
    </>
  )
}

export default KmlLayers
