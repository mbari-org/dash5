import React, { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

let coords: [number, number]

export const CenterView: React.FC<{
  coords?: [number, number]
  bounds?: [[number, number], [number, number]]
  zoom?: number
  viewMode?: 'center' | 'bounds' | null
}> = ({ coords, bounds, zoom, viewMode }) => {
  const map = useMap()

  useEffect(() => {
    // Use viewMode to determine which action to take
    if (viewMode === 'bounds' && bounds) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      })
    } else if (viewMode === 'center' && coords) {
      const zoomLevel = zoom !== undefined ? zoom : map.getZoom()
      map.setView(coords, zoomLevel)
    }
  }, [coords, bounds, zoom, viewMode, map])

  return null
}
