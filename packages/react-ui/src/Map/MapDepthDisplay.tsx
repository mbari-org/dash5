import React, { useCallback, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import {
  useDepthRequest,
  DepthRequestOptions,
} from '@mbari/utils/useDepthRequest'
import MouseCoordinates from './MouseCoordinates'

const TOPRIGHT_PANE_SELECTOR = '.leaflet-top.leaflet-right'

export type DepthRequestFn = (
  lat: number,
  lng: number
) => Promise<{ depth: number | null; status: string }>

export interface MapDepthDisplayProps {
  depthRequest: DepthRequestFn
  options?: DepthRequestOptions
}

/**
 * Self-contained map layer that owns depth request state and displays coordinates + depth.
 * Renders inside Map as a child; only this component re-renders when depth data updates.
 * Uses a React portal into the map's topright pane to avoid DOM conflicts with react-leaflet-custom-control.
 */
const MapDepthDisplay: React.FC<MapDepthDisplayProps> = ({
  depthRequest,
  options = {},
}) => {
  const map = useMap()
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const pane = map
      .getContainer()
      .querySelector(TOPRIGHT_PANE_SELECTOR) as HTMLElement | null
    if (!pane) return
    const div = document.createElement('div')
    pane.prepend(div)
    setWrapper(div)
    return () => {
      div.remove()
      setWrapper(null)
    }
  }, [map])

  const { handleDepthRequestWithFeedback } = useDepthRequest(
    depthRequest,
    options
  )

  const onRequestDepth = useCallback(
    (lat: number, lng: number) =>
      handleDepthRequestWithFeedback(lat, lng).then((r) => r.depth ?? 0),
    [handleDepthRequestWithFeedback]
  )

  if (!wrapper) return null

  return createPortal(
    <div className="leaflet-control">
      <MouseCoordinates onRequestDepth={onRequestDepth} />
    </div>,
    wrapper
  )
}

export default MapDepthDisplay
