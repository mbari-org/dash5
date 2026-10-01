import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'

const mockSetView = jest.fn()
const mockFlyTo = jest.fn()
const mockFitBounds = jest.fn()
const mockGetZoom = jest.fn(() => 8)
const mockInvalidateSize = jest.fn()
const mockEachLayer = jest.fn()
const mockOnce = jest.fn()
const mockSetFlyToRequest = jest.fn()
let mockFlyToRequest: {
  lat: number
  lon: number
  bounds?: [[number, number], [number, number]]
} | null = null

jest.mock('react-leaflet', () => ({
  useMap: () => ({
    setView: mockSetView,
    flyTo: mockFlyTo,
    fitBounds: mockFitBounds,
    getZoom: mockGetZoom,
    invalidateSize: mockInvalidateSize,
    eachLayer: mockEachLayer,
    once: mockOnce,
  }),
}))

jest.mock('../components/MapCameraContext', () => ({
  useMapCamera: () => ({
    flyToRequest: mockFlyToRequest,
    setFlyToRequest: mockSetFlyToRequest,
  }),
}))

import MapFlyTo from '../components/MapFlyTo'

describe('MapFlyTo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFlyToRequest = null
    mockGetZoom.mockReturnValue(8)
    mockEachLayer.mockImplementation(() => undefined)
    mockOnce.mockImplementation(() => undefined)
  })

  it('does nothing when there is no fly-to request', () => {
    render(<MapFlyTo />)

    expect(mockFlyTo).not.toHaveBeenCalled()
    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
  })

  it('flies to lat/lon at zoom 13 and clears the request', () => {
    mockFlyToRequest = { lat: 36.8, lon: -122.0 }

    render(<MapFlyTo />)

    expect(mockFlyTo).toHaveBeenCalledWith([36.8, -122.0], 13, {
      duration: 0.45,
    })
    expect(mockSetView).not.toHaveBeenCalled()
    expect(mockOnce).toHaveBeenCalledWith('moveend', expect.any(Function))
    expect(mockSetFlyToRequest).toHaveBeenCalledWith(null)
  })

  it('fits bounds when the request includes a bounds box', () => {
    const bounds: [[number, number], [number, number]] = [
      [36.0, -122.5],
      [37.0, -121.5],
    ]
    mockFlyToRequest = { lat: 36.5, lon: -122.0, bounds }

    render(<MapFlyTo />)

    expect(mockFitBounds).toHaveBeenCalledWith(bounds, {
      padding: [40, 40],
      animate: true,
    })
    expect(mockFlyTo).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).toHaveBeenCalledWith(null)
  })

  it('syncs GoogleMutant on fly-to and again on moveend, without redraw', () => {
    const update = jest.fn()
    const redraw = jest.fn()
    mockEachLayer.mockImplementation((cb: (layer: unknown) => void) =>
      cb({ _mutant: {}, _update: update, redraw })
    )
    mockOnce.mockImplementation((_event: string, cb: () => void) => cb())
    mockFlyToRequest = { lat: 36.7, lon: -121.8 }

    render(<MapFlyTo />)

    expect(update).toHaveBeenCalledTimes(2)
    expect(redraw).not.toHaveBeenCalled()
  })
})
