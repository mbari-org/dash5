import '@testing-library/jest-dom'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkerProvider, useMarkers } from './MarkerContext'
import { ConfirmationProvider } from './ConfirmContext'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock toast for testing
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

// Test component to access context
const TestComponent = () => {
  const {
    markers,
    handleAddMarker,
    handleMarkerDelete,
    saveMarkerToLayer,
    removeMarkerFromLayer,
    removeAllMarkersFromLayer,
  } = useMarkers()

  return (
    <div>
      <div data-testid="marker-count">{markers.length}</div>
      <div data-testid="layer-count">
        {markers.filter((m) => m.savedToLayer).length}
      </div>
      <button
        data-testid="add-marker"
        onClick={() => handleAddMarker(37.5, -122.1)}
      >
        Add Marker
      </button>
      <button
        data-testid="remove-all-from-layer"
        onClick={removeAllMarkersFromLayer}
      >
        Remove All From Layer
      </button>
      {markers.map((marker) => (
        <div key={marker.id} data-testid={`marker-${marker.id}`}>
          <span>{marker.label}</span>
          <span data-testid={`coords-${marker.id}`}>
            {marker.lat},{marker.lng}
          </span>
          <span data-testid={`layer-${marker.id}`}>
            {marker.savedToLayer ? 'In Layer' : 'Not In Layer'}
          </span>
          <button
            data-testid={`save-${marker.id}`}
            onClick={() => saveMarkerToLayer(marker.id.toString())}
          >
            Save to Layer
          </button>
          <button
            data-testid={`remove-${marker.id}`}
            onClick={() => removeMarkerFromLayer(marker.id.toString())}
          >
            Remove from Layer
          </button>
          <button
            data-testid={`delete-${marker.id}`}
            onClick={() => handleMarkerDelete(marker.id.toString())}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

describe('MarkerContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('adds a marker correctly', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    expect(screen.getByTestId('marker-count').textContent).toBe('0')

    await userEvent.click(screen.getByTestId('add-marker'))

    expect(screen.getByTestId('marker-count').textContent).toBe('1')
    expect(screen.getByTestId('marker-1')).toBeInTheDocument()
  })

  test('saves marker to layer', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))

    expect(screen.getByTestId('layer-1').textContent).toBe('In Layer')

    // Check if localStorage was updated (MarkerContext uses 'lrauv-map-markers')
    const layerMarkers = JSON.parse(
      mockLocalStorage.getItem('lrauv-map-markers') || '[]'
    )
    expect(layerMarkers.length).toBe(1)
    expect(layerMarkers[0].id).toBe(1)
    expect(layerMarkers[0].savedToLayer).toBe(true)
  })

  test('removes marker from layer', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))
    await userEvent.click(screen.getByTestId('remove-1'))

    expect(screen.getByTestId('layer-1').textContent).toBe('Not In Layer')

    // Only layer-saved markers are persisted; removed markers leave storage
    const layerMarkers = JSON.parse(
      mockLocalStorage.getItem('lrauv-map-markers') || '[]'
    )
    expect(layerMarkers.length).toBe(0)
  })

  test('deletes marker correctly', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    expect(screen.getByTestId('marker-1')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('delete-1'))
    expect(screen.queryByTestId('marker-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('marker-count').textContent).toBe('0')
  })

  test('removes all markers from layer but keeps them on the map', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))
    await userEvent.click(screen.getByTestId('save-2'))
    expect(screen.getByTestId('layer-count').textContent).toBe('2')

    await userEvent.click(screen.getByTestId('remove-all-from-layer'))
    expect(
      screen.getByText(
        'Remove all markers from layer? They will remain on the map.'
      )
    ).toBeInTheDocument()
    await userEvent.click(screen.getByText('Confirm'))

    expect(screen.getByTestId('marker-count').textContent).toBe('2')
    expect(screen.getByTestId('layer-count').textContent).toBe('0')
    expect(screen.getByTestId('layer-1').textContent).toBe('Not In Layer')
    expect(screen.getByTestId('layer-2').textContent).toBe('Not In Layer')
  })

  test('does not remove from layer when bulk remove is cancelled', async () => {
    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))
    await userEvent.click(screen.getByTestId('remove-all-from-layer'))
    await userEvent.click(screen.getByText('Cancel'))

    expect(screen.getByTestId('layer-1').textContent).toBe('In Layer')
  })

  test('restores layer-saved markers from localStorage on mount', async () => {
    mockLocalStorage.setItem(
      'lrauv-map-markers',
      JSON.stringify([
        {
          id: 9,
          lat: 36.7,
          lng: -122.0,
          index: 0,
          label: 'Persisted Marker',
          savedToLayer: true,
          visible: true,
        },
      ])
    )

    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('marker-count').textContent).toBe('1')
    })
    expect(screen.getByTestId('marker-9')).toBeInTheDocument()
    expect(screen.getByTestId('layer-9').textContent).toBe('In Layer')
  })

  test('persists layer markers across remount and drops session-only markers', async () => {
    const { unmount } = render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))
    // Marker 2 stays session-only

    expect(screen.getByTestId('marker-count').textContent).toBe('2')
    expect(screen.getByTestId('layer-count').textContent).toBe('1')

    unmount()

    render(
      <ConfirmationProvider>
        <MarkerProvider>
          <TestComponent />
        </MarkerProvider>
      </ConfirmationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('marker-count').textContent).toBe('1')
    })
    expect(screen.getByTestId('marker-1')).toBeInTheDocument()
    expect(screen.getByTestId('layer-1').textContent).toBe('In Layer')
    expect(screen.queryByTestId('marker-2')).not.toBeInTheDocument()
  })
})
