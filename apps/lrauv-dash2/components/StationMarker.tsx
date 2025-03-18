import React from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'

interface StationMarkerProps {
  name: string
  lat: number
  lng: number
}

const StationMarker: React.FC<StationMarkerProps> = ({ name, lat, lng }) => {
  return (
    <CircleMarker
      key={name}
      center={[lat, lng]}
      radius={5}
      fillColor="transparent"
      color="yellow"
      fillOpacity={1}
    >
      <Tooltip>
        <span>
          {name}
          <br />
          Latitude: {lat}
          <br />
          Longitude: {lng}
        </span>
      </Tooltip>
    </CircleMarker>
  )
}

export default StationMarker
