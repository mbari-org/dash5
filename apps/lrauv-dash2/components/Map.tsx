import {
  TileLayer,
  MapContainer,
  Marker,
  Popup,
  LayersControl,
  FeatureGroup,
} from 'react-leaflet'
import L from 'leaflet'
import React, { useEffect, useRef } from 'react'
import 'leaflet-mouse-position/src/L.Control.MousePosition'
import 'leaflet-measure/dist/leaflet-measure'
import * as esri from 'esri-leaflet'

export interface MapProps {
  className?: string
  style?: React.CSSProperties
}

const Map: React.FC<MapProps> = ({ className, style }) => {
  const mapRef = useRef<L.Map>(null)

  const esriOceansLayer = esri.basemapLayer('Oceans', {
    maxNativeZoom: 13,
    maxZoom: 20,
  })
  const esriOceansLabelsLayer = esri.basemapLayer('OceansLabels', {
    maxNativeZoom: 13,
    maxZoom: 20,
  })
  console.log(esriOceansLayer)
  console.log(esriOceansLabelsLayer)
  const esriOceansWithLabelsLayer = L.featureGroup([
    esriOceansLayer,
    esriOceansLabelsLayer,
  ])

  // TODO leaflet or esri bug? radio button 'ESRI Oceans' seems to be always pre-selected
  // if 'ESRI Oceans' is added, even though we are adding oceans-with-labels 1st and to the map.
  // Also, a 2nd click on oceans-with-labels brings the one with only the labels!
  const baseLayers = {
    'ESRI Oceans/Labels': esriOceansWithLabelsLayer,
  }
  console.log(baseLayers)

  useEffect(() => {
    if (mapRef.current) {
      L.control.layers(baseLayers).addTo(mapRef.current)
    } else {
      console.log('No map!')
    }
  })

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      className={className}
      style={style}
      ref={mapRef}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="OpenStreetmaps">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="ESRI Oceans/Labels">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            {...esriOceansLayer}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="'Dark Layer (CARTO)'" checked>
          <TileLayer
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default Map
