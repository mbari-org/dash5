import { TileLayer, MapContainer, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import React, { useRef } from 'react'

export interface MapProps {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  zoom?: number
}

export const Map: React.FC<MapProps> = ({
  className,
  style,
  center = [36.618264, -121.9017919],
  zoom = 13,
  children,
}) => {
  const mapRef = useRef<L.Map>(null)

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={style}
      ref={mapRef}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="ESRI Oceans/Labels" checked>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://developers.arcgis.com/">ArcGIS</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenStreetmaps">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="'Dark Layer (CARTO)'">
          <TileLayer
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {children}
    </MapContainer>
  )
}

Map.displayName = 'Map.Map'
