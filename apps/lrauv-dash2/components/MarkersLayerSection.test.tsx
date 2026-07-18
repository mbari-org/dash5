import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkersLayerSection } from './MarkersLayerSection'

const mockRemoveMarkerFromLayer = jest.fn()
const mockRemoveAllMarkersFromLayer = jest.fn()
const mockSetFlyToRequest = jest.fn()

jest.mock('./MarkerContext', () => ({
  useMarkers: () => ({
    removeMarkerFromLayer: mockRemoveMarkerFromLayer,
    removeAllMarkersFromLayer: mockRemoveAllMarkersFromLayer,
  }),
}))

jest.mock('./MapCameraContext', () => ({
  useMapCamera: () => ({
    setFlyToRequest: mockSetFlyToRequest,
  }),
}))

const baseProps = {
  isFiltering: false,
  filteredMarkers: [] as Array<{
    id: number | string
    label?: string
    lat?: number
    lng?: number
    visible?: boolean
    savedToLayer?: boolean
  }>,
  layerMarkers: [] as Array<{
    id: number | string
    label?: string
    lat?: number
    lng?: number
    visible?: boolean
    savedToLayer?: boolean
  }>,
  expandedSections: { markers: true },
  toggleExpanded: jest.fn(),
  handleToggleSelectAllMarkers: jest.fn(),
  toggleMarkerVisibility: jest.fn(),
}

const layerMarkers = [
  {
    id: 1,
    label: 'Waypoint A',
    lat: 36.7,
    lng: -122.0,
    iconColor: '#00AA00',
    visible: true,
    savedToLayer: true,
  },
  {
    id: 2,
    label: 'Waypoint B',
    lat: 36.8,
    lng: -122.1,
    iconColor: '#0000FF',
    visible: true,
    savedToLayer: true,
  },
]

describe('MarkersLayerSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('shows empty state when no markers are saved to layer', () => {
    render(<MarkersLayerSection {...baseProps} />)

    expect(screen.getByText('Markers')).toBeInTheDocument()
    expect(screen.getByText('No markers saved to layer')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Remove all from layer' })
    ).not.toBeInTheDocument()
  })

  test('returns null when filtering and no markers match', () => {
    const { container } = render(
      <MarkersLayerSection
        {...baseProps}
        isFiltering
        filteredMarkers={[]}
        layerMarkers={layerMarkers}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('renders saved markers and remove-all-from-layer action', () => {
    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    expect(screen.getByText('Waypoint A')).toBeInTheDocument()
    expect(screen.getByText('Waypoint B')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remove all from layer' })
    ).toBeInTheDocument()
  })

  test('removes a marker from layer when remove is confirmed', async () => {
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true)

    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Waypoint A from layer' })
    )

    expect(window.confirm).toHaveBeenCalledWith(
      'Remove "Waypoint A" from layer? It will remain on the map.'
    )
    expect(mockRemoveMarkerFromLayer).toHaveBeenCalledWith('1')
  })

  test('does not remove a marker when remove is cancelled', async () => {
    jest.spyOn(window, 'confirm').mockReturnValueOnce(false)

    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Waypoint A from layer' })
    )

    expect(mockRemoveMarkerFromLayer).not.toHaveBeenCalled()
  })

  test('calls removeAllMarkersFromLayer when bulk remove is clicked', async () => {
    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove all from layer' })
    )

    expect(mockRemoveAllMarkersFromLayer).toHaveBeenCalledTimes(1)
  })

  test('toggles marker visibility when checkbox is clicked', async () => {
    const toggleMarkerVisibility = jest.fn()

    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
        toggleMarkerVisibility={toggleMarkerVisibility}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    // index 0 is the Markers parent checkbox; index 1 is Waypoint A
    await userEvent.click(checkboxes[1])

    expect(toggleMarkerVisibility).toHaveBeenCalledWith('1')
    expect(checkboxes[1]).toHaveAttribute(
      'title',
      'Show/hide on map (stays in layer)'
    )
  })

  test('centers the map on a marker when center is clicked', async () => {
    render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on Waypoint A' })
    )

    expect(mockSetFlyToRequest).toHaveBeenCalledWith({
      lat: 36.7,
      lon: -122.0,
    })
  })

  test('uses each marker iconColor in the layers list', () => {
    const { container } = render(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    const icons = container.querySelectorAll('svg[style*="color"]')
    const iconColors = Array.from(icons).map(
      (icon) => (icon as SVGElement).style.color
    )

    expect(iconColors).toEqual(
      expect.arrayContaining(['rgb(0, 170, 0)', 'rgb(0, 0, 255)'])
    )
  })
})
