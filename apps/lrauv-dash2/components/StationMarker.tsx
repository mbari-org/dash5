import React from 'react'
import { Circle, CircleMarker, Tooltip } from 'react-leaflet'

// Matches names like "MARS 1km Circle", "MARS 2km Circle", "Foo 0.5km Circle"
const KM_CIRCLE_PATTERN = /(\d+(?:\.\d+)?)\s*km\s*circle/i

const CIRCLE_STATION_COLOR = '#cc44cc'

interface StationMarkerProps {
  name: string
  lat: number
  lng: number
  color?: string
  isHighlighted?: boolean
}

const StationMarker: React.FC<StationMarkerProps> = ({
  name,
  lat,
  lng,
  color,
  isHighlighted = false,
}) => {
  const kmMatch = name.match(KM_CIRCLE_PATTERN)
  const radiusMeters = kmMatch ? parseFloat(kmMatch[1]) * 1000 : null
  // Use the API-provided color, falling back to defaults per station type.
  // km-circle stations default to magenta; all others default to yellow.
  const markerColor =
    color ?? (radiusMeters != null ? CIRCLE_STATION_COLOR : 'yellow')

  const tooltip = (
    <Tooltip>
      <span>
        {name}
        <br />
        Latitude: {lat}
        <br />
        Longitude: {lng}
        {radiusMeters != null && (
          <>
            <br />
            Radius:{' '}
            {radiusMeters >= 1000
              ? `${radiusMeters / 1000} km`
              : `${radiusMeters} m`}
          </>
        )}
      </span>
    </Tooltip>
  )

  if (radiusMeters != null) {
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
              pathOptions={{ dashArray: '6 5', interactive: false }}
              interactive={false}
            />
            {/* Inner yellow dashed spotlight ring */}
            <CircleMarker
              center={[lat, lng]}
              radius={14}
              fillColor="transparent"
              color="#FFD700"
              weight={2}
              fillOpacity={0}
              pathOptions={{ dashArray: '6 5', interactive: false }}
              interactive={false}
            />
          </>
        )}
        {/* Geographic radius circle — non-interactive so it doesn't block
            pan/drag or create a huge hover target; tooltip lives on center dot */}
        <Circle
          center={[lat, lng]}
          radius={radiusMeters}
          color={markerColor}
          weight={2}
          fillColor={markerColor}
          fillOpacity={0.08}
          interactive={false}
          pathOptions={{ interactive: false }}
        />
        {/* White halo ring so the center dot is visible against same-colored vehicle paths */}
        <CircleMarker
          center={[lat, lng]}
          radius={7}
          fillColor="transparent"
          color="white"
          fillOpacity={0}
          weight={3}
          interactive={false}
        />
        <CircleMarker
          center={[lat, lng]}
          radius={5}
          color={markerColor}
          fillColor="transparent"
          fillOpacity={0}
          weight={2}
        >
          {tooltip}
        </CircleMarker>
      </>
    )
  }

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
            pathOptions={{ dashArray: '6 5', interactive: false }}
            interactive={false}
          />
          {/* Inner yellow dashed spotlight ring */}
          <CircleMarker
            center={[lat, lng]}
            radius={14}
            fillColor="transparent"
            color="#FFD700"
            weight={2}
            fillOpacity={0}
            pathOptions={{ dashArray: '6 5', interactive: false }}
            interactive={false}
          />
        </>
      )}
      {/* White halo ring so the marker is visible against same-colored vehicle paths */}
      <CircleMarker
        center={[lat, lng]}
        radius={7}
        fillColor="transparent"
        color="white"
        fillOpacity={0}
        weight={3}
        interactive={false}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={5}
        fillColor="transparent"
        color={markerColor}
        fillOpacity={0}
        weight={2}
      >
        {tooltip}
      </CircleMarker>
    </>
  )
}

export default StationMarker
