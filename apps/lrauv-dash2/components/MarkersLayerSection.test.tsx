import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkersLayerSection, VISIBILITY_TOOLTIP } from './MarkersLayerSection'
import type { MarkerData } from './MarkerContext'
import { ConfirmationProvider } from './ConfirmContext'

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

const renderSection = (ui: React.ReactElement) =>
  render(<ConfirmationProvider>{ui}</ConfirmationProvider>)

const baseProps = {
  isFiltering: false,
  filteredMarkers: [] as MarkerData[],
  layerMarkers: [] as MarkerData[],
  expandedSections: { markers: true },
  toggleExpanded: jest.fn(),
  handleToggleSelectAllMarkers: jest.fn(),
  toggleMarkerVisibility: jest.fn(),
}

const layerMarkers: MarkerData[] = [
  {
    id: 1,
    index: 0,
    label: 'Waypoint A',
    lat: 36.7,
    lng: -122.0,
    iconColor: '#00AA00',
    visible: true,
    savedToLayer: true,
  },
  {
    id: 2,
    index: 1,
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
    renderSection(<MarkersLayerSection {...baseProps} />)

    expect(screen.getByText('Markers')).toBeInTheDocument()
    expect(screen.getByText('No markers saved to layer')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Remove all from layer' })
    ).not.toBeInTheDocument()
  })

  test('returns null when filtering and no markers match', () => {
    const { container } = renderSection(
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
    renderSection(
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
    renderSection(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Waypoint A from layer' })
    )
    expect(
      screen.getByText(
        'Remove "Waypoint A" from layer? It will remain on the map.'
      )
    ).toBeInTheDocument()
    await userEvent.click(screen.getByText('Confirm'))

    expect(mockRemoveMarkerFromLayer).toHaveBeenCalledWith('1')
  })

  test('does not remove a marker when remove is cancelled', async () => {
    renderSection(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={layerMarkers}
        layerMarkers={layerMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Waypoint A from layer' })
    )
    await userEvent.click(screen.getByText('Cancel'))

    expect(mockRemoveMarkerFromLayer).not.toHaveBeenCalled()
  })

  test('calls removeAllMarkersFromLayer when bulk remove is clicked', async () => {
    renderSection(
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

    renderSection(
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
    expect(checkboxes[1]).toHaveAttribute('title', VISIBILITY_TOOLTIP)
  })

  test('centers the map on a marker when center is clicked', async () => {
    renderSection(
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

  test('normalizes out-of-bounds coordinates before centering', async () => {
    const wrappedMarkers: MarkerData[] = [
      {
        id: 3,
        index: 0,
        label: 'Wrapped',
        lat: 95,
        lng: 190,
        visible: true,
        savedToLayer: true,
      },
    ]

    renderSection(
      <MarkersLayerSection
        {...baseProps}
        filteredMarkers={wrappedMarkers}
        layerMarkers={wrappedMarkers}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on Wrapped' })
    )

    expect(mockSetFlyToRequest).toHaveBeenCalledWith({
      lat: 90,
      lon: -170,
    })
  })

  test('uses each marker iconColor in the layers list', () => {
    const { container } = renderSection(
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
