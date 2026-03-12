import React from 'react'
import { renderToString } from 'react-dom/server'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { divIcon } from 'leaflet'
import WaypointIcon, { WAYPOINT_ICON_COLOR } from './WaypointIcon'

const W = 22
const H = 32

export interface WaypointMapMarkerProps {
  position: [number, number]
  number: number
  draggable?: boolean
  onDragEnd?: (newPosition: [number, number]) => void
}

const createWaypointIcon = (number: number): L.DivIcon => {
  const iconHtml = renderToString(
    <WaypointIcon number={number} color={WAYPOINT_ICON_COLOR} />
  )
  return divIcon({
    className: 'waypoint-map-marker',
    html: iconHtml,
    iconSize: [W, H],
    iconAnchor: [W / 2, H],
    tooltipAnchor: [W / 2, -H * 0.6],
  })
}

const WaypointMapMarker: React.FC<WaypointMapMarkerProps> = ({
  position,
  number,
  draggable = false,
  onDragEnd,
}) => {
  const icon = React.useMemo(() => createWaypointIcon(number), [number])

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={draggable}
      eventHandlers={
        onDragEnd
          ? {
              dragend: (e: L.LeafletEvent) => {
                const marker = e.target as L.Marker
                const latlng = marker.getLatLng()
                onDragEnd([latlng.lat, latlng.lng])
              },
            }
          : undefined
      }
    >
      <Tooltip permanent={false} direction="top">
        Waypoint {number}
      </Tooltip>
    </Marker>
  )
}

export default WaypointMapMarker
