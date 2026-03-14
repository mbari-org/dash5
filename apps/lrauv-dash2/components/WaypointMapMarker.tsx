import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  onDelete?: () => void
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
  onDelete,
}) => {
  const icon = React.useMemo(() => createWaypointIcon(number), [number])
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      setContextMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [contextMenu])

  const handleContextMenu = (e: L.LeafletMouseEvent) => {
    e.originalEvent.preventDefault()
    if (onDelete) {
      setContextMenu({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
      })
    }
  }

  const handleDelete = () => {
    onDelete?.()
    setContextMenu(null)
  }

  const eventHandlers: L.LeafletEventHandlerFnMap = {
    ...(onDragEnd
      ? {
          dragend: (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker
            const latlng = marker.getLatLng()
            onDragEnd([latlng.lat, latlng.lng])
          },
        }
      : {}),
    ...(onDelete ? { contextmenu: handleContextMenu } : {}),
  }

  return (
    <>
      <Marker
        position={position}
        icon={icon}
        draggable={draggable}
        eventHandlers={
          Object.keys(eventHandlers).length ? eventHandlers : undefined
        }
      >
        <Tooltip permanent={false} direction="top">
          Waypoint {number}
        </Tooltip>
      </Marker>
      {contextMenu &&
        createPortal(
          <div
            ref={menuRef}
            className="waypoint-context-menu rounded border border-gray-300 bg-white py-1 shadow-lg"
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 2000,
              minWidth: '6rem',
            }}
            role="menu"
          >
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDelete}
              role="menuitem"
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  )
}

export default WaypointMapMarker
