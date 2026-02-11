import type React from 'react'
import type L from 'leaflet'

export interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  centerZoom?: number
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxNativeZoom?: number
  fitBounds?: [[number, number], [number, number]]
  viewMode?: 'center' | 'bounds' | null
  scrollWheelZoom?: boolean
  isAddingMarkers?: boolean
  onToggleMarkerMode?: () => void
  onRequestMarkers?: (position?: { top: number; left: number }) => void
  onRequestCoordinate?: () => void
  onRequestFitBounds?: () => void
  onRequestPlatforms?: () => void
  onRequestStations?: (position?: { top: number; left: number }) => void
  onRequestVehicleColors?: (vehicleName?: string) => void
  whenCreated?: (map: L.Map) => void
  onMapReady?: (map: L.Map) => void
  trackedVehicles?: Array<{ id: string; name: string }>
  dmsCoord?: string
  mapCoord?: string
  children?: React.ReactNode
  renderMapClickHandler?: (props: {
    isAddingMarkers: boolean
    isEditingMarker: boolean
    onAddMarker: (lat: number, lng: number) => number
  }) => React.ReactNode
  renderCustomMarkerSet?: (props: {
    isAddingMarkers: boolean
    setIsAddingMarkers: React.Dispatch<React.SetStateAction<boolean>>
  }) => React.ReactNode
  renderDraggableMarkers?: (props: {
    markers: Array<{
      id: number
      lat: number
      lng: number
      index: number
      label: string
    }>
    handleMarkerDragEnd: (
      id: number,
      position: { lat: number; lng: number }
    ) => void
  }) => React.ReactNode
}
