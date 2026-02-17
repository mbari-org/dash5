import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkerProvider, useMarkers } from './MarkerContext'

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
  } = useMarkers()

  return (
    <div>
      <div data-testid="marker-count">{markers.length}</div>
      <button
        data-testid="add-marker"
        onClick={() => handleAddMarker(37.5, -122.1)}
      >
        Add Marker
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

  test('adds a marker correctly', async () => {
    render(
      <MarkerProvider>
        <TestComponent />
      </MarkerProvider>
    )

    expect(screen.getByTestId('marker-count').textContent).toBe('0')

    await userEvent.click(screen.getByTestId('add-marker'))

    expect(screen.getByTestId('marker-count').textContent).toBe('1')
    expect(screen.getByTestId('marker-1')).toBeInTheDocument()
  })

  test('saves marker to layer', async () => {
    render(
      <MarkerProvider>
        <TestComponent />
      </MarkerProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))

    expect(screen.getByTestId('layer-1').textContent).toBe('In Layer')

    // Check if localStorage was updated
    const layerMarkers = JSON.parse(
      mockLocalStorage.getItem('layerMarkers') || '[]'
    )
    expect(layerMarkers.length).toBe(1)
    expect(layerMarkers[0].id).toBe(1)
    expect(layerMarkers[0].savedToLayer).toBe(true)
  })

  test('removes marker from layer', async () => {
    render(
      <MarkerProvider>
        <TestComponent />
      </MarkerProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    await userEvent.click(screen.getByTestId('save-1'))
    await userEvent.click(screen.getByTestId('remove-1'))

    expect(screen.getByTestId('layer-1').textContent).toBe('Not In Layer')

    // Check if localStorage was updated
    const layerMarkers = JSON.parse(
      mockLocalStorage.getItem('layerMarkers') || '[]'
    )
    expect(layerMarkers.length).toBe(0)
  })

  test('deletes marker correctly', async () => {
    render(
      <MarkerProvider>
        <TestComponent />
      </MarkerProvider>
    )

    await userEvent.click(screen.getByTestId('add-marker'))
    expect(screen.getByTestId('marker-1')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('delete-1'))
    expect(screen.queryByTestId('marker-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('marker-count').textContent).toBe('0')
  })
})
