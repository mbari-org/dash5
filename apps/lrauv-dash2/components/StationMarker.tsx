import React from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'

interface StationMarkerProps {
  name: string
  lat: number
  lng: number
  isHighlighted?: boolean
}

const StationMarker: React.FC<StationMarkerProps> = ({
  name,
  lat,
  lng,
  isHighlighted = false,
}) => {
  return (
    <>
      {isHighlighted && (
        <>
          {/* Outer red dashed spotlight ring */}
          <CircleMarker
            center={[lat, lng]}
            radius={28}
            fillColor="transparent"
            color="red"
            weight={2}
            fillOpacity={0}
            pathOptions={{ dashArray: '6 5' }}
          />
          {/* Inner orange dashed spotlight ring */}
          <CircleMarker
            center={[lat, lng]}
            radius={14}
            fillColor="transparent"
            color="#F57C00"
            weight={2}
            fillOpacity={0}
            pathOptions={{ dashArray: '6 5' }}
          />
        </>
      )}
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
    </>
  )
}

export default StationMarker
