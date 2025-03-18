import React, { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

let coords: [number, number]

export const CenterView: React.FC<{
  coords?: [number, number]
  bounds?: [[number, number], [number, number]]
}> = ({ coords, bounds }) => {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      console.log('CenterView - Fitting bounds:', bounds)
      map.fitBounds(bounds, {
        padding: [50, 50], // Add padding around bounds
        maxZoom: 15, // Don't zoom in too far
      })
    } else if (coords) {
      console.log('CenterView - Setting center:', coords)
      map.setView(coords, map.getZoom())
    }
  }, [coords, bounds, map])

  return null
}
