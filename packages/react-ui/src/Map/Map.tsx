import {
  TileLayer,
  MapContainer,
  WMSTileLayer,
  LayersControl,
  ScaleControl,
} from 'react-leaflet'
import React, { useMemo } from 'react'
import { useMapBaseLayer, BaseLayerOption } from './useMapBaseLayer'

export interface MapProps {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxNativeZoom?: number
  scrollWheelZoom?: boolean
  children?: React.ReactNode
}

const Map: React.FC<MapProps> = ({
  className,
  style,
  center = [36.7849, -122.12097],
  zoom = 17,
  minZoom = 4,
  maxZoom = 17,
  maxNativeZoom = 13,
  children,
}) => {
  const { baseLayer, setBaseLayer } = useMapBaseLayer()
  const addBaseLayerHandler = (layer: BaseLayerOption) => () => {
    setBaseLayer(layer)
  }
  //const esriVectorLayerRef = useRef();

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
    [baseLayer]
  )
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
      // @ts-ignore
      // easyBtn={easyBtn}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          name="ESRI Oceans/Labels"
          checked={baseLayer === 'ESRI Oceans/Labels'}
        >
          <TileLayer
            url="https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?//token=<ACCESS_TOKEN>process.env.REACT_APP_ESRI_API_KEY</ACCESS_TOKEN>"
            attribution='&copy; <a href="https://developers.arcgis.com/">ArcGIS</a>'
            maxNativeZoom={13}
            eventHandlers={{
              add: addBaseLayerHandler('ESRI Oceans/Labels'),
            }}
          />
        </LayersControl.BaseLayer>
        {gmrtLayer}
        <LayersControl.BaseLayer name="OpenStreetmaps">
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
      <ScaleControl position="topright" />
      <div className={'leaflet-control'}>{children}</div>
      <button className="font-bold bg-blue-600 px-6 py-3 text-white rounded-md">
        Blue button
      </button>
    </MapContainer>
  )
}

Map.displayName = 'Map.Map'

export default Map
