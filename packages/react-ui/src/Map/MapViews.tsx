import React, { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

let coords: [number, number]

export const CenterViewComponent: React.FC<{ coords: [number, number] }> = ({
  coords,
}) => {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, map.getZoom())
    console.log('Centering map to', coords)
  }, [coords, map])

  return null
}
