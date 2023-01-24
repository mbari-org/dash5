import { useState, useRef, useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import mapMarker from './markers/mapMarker.svg'
import mapMarker1 from './markers/mapMarker1.svg'
import mapMarker2 from './markers/mapMarker2.svg'
import mapMarker3 from './markers/mapMarker3.svg'
import mapMarker4 from './markers/mapMarker4.svg'
import mapMarker5 from './markers/mapMarker5.svg'
import mapMarker6 from './markers/mapMarker6.svg'
import mapMarker7 from './markers/mapMarker7.svg'
import mapMarker8 from './markers/mapMarker8.svg'
import mapMarker9 from './markers/mapMarker9.svg'
import mapMarker10 from './markers/mapMarker10.svg'
import mapMarker11 from './markers/mapMarker11.svg'
import mapMarker12 from './markers/mapMarker12.svg'
import mapMarker13 from './markers/mapMarker13.svg'
import mapMarker14 from './markers/mapMarker14.svg'
import mapMarker15 from './markers/mapMarker15.svg'
import mapMarker16 from './markers/mapMarker16.svg'
import mapMarker17 from './markers/mapMarker17.svg'
import mapMarker18 from './markers/mapMarker18.svg'
import mapMarker19 from './markers/mapMarker19.svg'

const mapMarkerIcons = [
  mapMarker1,
  mapMarker2,
  mapMarker3,
  mapMarker4,
  mapMarker5,
  mapMarker6,
  mapMarker7,
  mapMarker8,
  mapMarker9,
  mapMarker10,
  mapMarker11,
  mapMarker12,
  mapMarker13,
  mapMarker14,
  mapMarker15,
  mapMarker16,
  mapMarker17,
  mapMarker18,
  mapMarker19,
]

const DraggableMarker: React.FC<{
  draggable: boolean
  lat: number
  lng: number
  index: number
  onDragEnd: (index: number, latlng: L.LatLng) => void
}> = ({ draggable, lat, lng, index, onDragEnd: handleDragEnd }) => {
  const [position, setPosition] = useState({ lat, lng })
  const markerRef = useRef<L.Marker | null>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
          handleDragEnd?.(index, { ...marker.getLatLng() })
        }
      },
    }),
    [handleDragEnd]
  )
  const icon = mapMarkerIcons[index] ?? mapMarker

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={
        new L.Icon({
          iconUrl: icon?.src,
          iconRetinaUrl: icon?.src,
          popupAnchor: [-0, -0],
          iconSize: [32, 45],
          iconAnchor: [16, 45],
        })
      }
    />
  )
}

DraggableMarker.displayName = 'Map.DraggableMarker'

export default DraggableMarker
