import {
  TileLayer,
  MapContainer,
  WMSTileLayer,
  LayersControl,
  ScaleControl,
} from 'react-leaflet'
import Control from 'react-leaflet-custom-control'
import 'leaflet/dist/leaflet.css'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer'
import MouseCoordinates, { MouseCoordinatesProps } from './MouseCoordinates'
import { useMapBaseLayer, BaseLayerOption } from './useMapBaseLayer'
import 'leaflet-mouse-position'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRulerCombined } from '@fortawesome/free-solid-svg-icons'
import { Measurement } from './Measurement'

export interface MapProps {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxNativeZoom?: number
  scrollWheelZoom?: boolean
  onRequestDepth?: MouseCoordinatesProps['onRequestDepth']
  children?: React.ReactNode
}

export type MeasureMode = 'closed' | 'open' | 'measuring'

const Map: React.FC<MapProps> = ({
  className,
  style,
  center = [36.7849, -122.12097],
  zoom = 17,
  minZoom = 4,
  maxZoom = 17,
  maxNativeZoom = 13,
  children,
  onRequestDepth,
}) => {
  const { baseLayer, setBaseLayer } = useMapBaseLayer()
  const addBaseLayerHandler = useCallback(
    (layer: BaseLayerOption) => () => {
      setBaseLayer(layer)
    },
    [setBaseLayer]
  )
  const [measurements, setMeasurements] = useState<
    { id: string; editing?: boolean }[]
  >([])

  const gmrtLayer = useMemo(
    () => (
      <LayersControl.BaseLayer name="GMRT">
        <WMSTileLayer
          params={{
            layers: 'GMRT',
            format: 'image/png',
          }}
          url="https://www.gmrt.org/services/mapserver/wms_merc?"
          maxNativeZoom={maxNativeZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          eventHandlers={{
            add: addBaseLayerHandler('GMRT'),
          }}
        />{' '}
      </LayersControl.BaseLayer>
    ),
    [addBaseLayerHandler, maxNativeZoom, minZoom, maxZoom]
  )
  const [measureMode, setMeasureMode] = useState<MeasureMode>('closed')
  const changeMeasureMode = (mode: MeasureMode) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (mode === 'measuring') {
      setMeasurements((prev) => [
        ...prev,
        { id: Date.now().toLocaleString(), editing: true },
      ])
    }
    if (mode === 'closed') {
      setMeasurements((prev) => prev.map((p) => ({ ...p, editing: false })))
    }
    setMeasureMode(mode)
  }

  const removeMeasurment = (id: string) => () => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
      style={style}
      minZoom={minZoom}
      maxZoom={maxZoom}
      // @ts-ignore
      maxNativeZoom={maxNativeZoom}
    >
      <ScaleControl position="topright" />
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          name="Google Hybrid"
          checked={baseLayer === 'Google Hybrid'}
        >
          <ReactLeafletGoogleLayer
            useGoogMapsLoader={false}
            type="hybrid"
            eventHandlers={{
              add: addBaseLayerHandler('Google Hybrid'),
            }}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          name="ESRI Oceans/Labels"
          checked={baseLayer === 'ESRI Oceans/Labels'}
        >
          <TileLayer
            url="https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?//token=<ACCESS_TOKEN>process.env.REACT_APP_ESRI_API_KEY</ACCESS_TOKEN>"
            attribution='&copy; <a href="https://developers.arcgis.com/">ArcGIS</a>'
            maxNativeZoom={maxNativeZoom}
            eventHandlers={{
              add: addBaseLayerHandler('ESRI Oceans/Labels'),
            }}
          />
        </LayersControl.BaseLayer>
        {gmrtLayer}
        <LayersControl.BaseLayer
          name="OpenStreetmaps"
          checked={baseLayer === 'OpenStreetmaps'}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              add: addBaseLayerHandler('OpenStreetmaps'),
            }}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          name="Dark Layer (CARTO)"
          checked={baseLayer === 'Dark Layer (CARTO)'}
        >
          <TileLayer
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png"
            eventHandlers={{
              add: addBaseLayerHandler('Dark Layer (CARTO)'),
            }}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {children}
      {measurements.map((m) => (
        <Measurement
          key={m.id}
          editing={m.editing}
          onDelete={removeMeasurment(m.id)}
        />
      ))}
      <div className={'leaflet-control'}>{children}</div>
      <Control position="topright">
        {measureMode === 'measuring' ? (
          <div
            className="rounded bg-white p-2 text-stone-500"
            style={{
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              maxWidth: 160,
            }}
          >
            <p className="pb-2">
              Click any where on the map to create a measurement.
            </p>
            <button
              onClick={changeMeasureMode('closed')}
              className="w-full rounded border bg-primary-600 p-1 text-white"
            >
              Done
            </button>
          </div>
        ) : null}
        {measureMode === 'open' ? (
          <div
            className="rounded bg-white p-2 text-stone-500"
            style={{
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              maxWidth: 160,
            }}
          >
            <p className="pb-2">
              Start a new measurement to measure distance / area between points.
            </p>
            <ul className="grid grid-cols-2 gap-2">
              <button
                onClick={changeMeasureMode('measuring')}
                className="rounded border bg-primary-600 p-1 text-white"
              >
                New
              </button>
              <button
                onClick={changeMeasureMode('closed')}
                className="rounded border border-primary-600 p-1 text-primary-600"
              >
                Cancel
              </button>
            </ul>
          </div>
        ) : null}
        {measureMode === 'closed' ? (
          <button
            className="rounded bg-white p-2 text-stone-500"
            style={{
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              width: 48,
            }}
            onClick={changeMeasureMode('open')}
          >
            <FontAwesomeIcon icon={faRulerCombined} size="2xl" />
          </button>
        ) : null}
      </Control>
      <Control prepend position="topright">
        <MouseCoordinates onRequestDepth={onRequestDepth} />
      </Control>
    </MapContainer>
  )
}

Map.displayName = 'Map.Map'

export default Map
