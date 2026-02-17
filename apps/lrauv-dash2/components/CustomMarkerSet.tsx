import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface CustomMarkerSetProps {
  isAddingMarkers: boolean
  setIsAddingMarkers: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * CustomMarkerSet - A simple component for visual feedback during marker adding mode
 * This component ONLY handles visual feedback (cursor changes) and contains no marker state
 */
const CustomMarkerSet: React.FC<CustomMarkerSetProps> = ({
  isAddingMarkers,
  setIsAddingMarkers,
}) => {
  const map = useMap()

  // Update cursor based on marker mode
  useEffect(() => {
    if (!map) return

    if (isAddingMarkers) {
      map.getContainer().style.cursor = 'crosshair'
    } else {
      map.getContainer().style.cursor = ''
    }

    return () => {
      if (map) {
        map.getContainer().style.cursor = ''
      }
    }
  }, [isAddingMarkers, map])

  return null // This component doesn't render any visible UI elements
}

export default CustomMarkerSet
