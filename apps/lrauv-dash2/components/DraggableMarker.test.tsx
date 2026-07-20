import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('react-leaflet', () => {
  const mockReact = require('react')
  return {
    Marker: mockReact.forwardRef(
      (
        { children }: { children?: React.ReactNode },
        _ref: React.Ref<HTMLDivElement>
      ) => <div data-testid="leaflet-marker">{children}</div>
    ),
    Popup: mockReact.forwardRef(
      (
        { children }: { children?: React.ReactNode },
        _ref: React.Ref<HTMLDivElement>
      ) => <div data-testid="leaflet-popup">{children}</div>
    ),
    Tooltip: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="leaflet-tooltip">{children}</div>
    ),
    useMap: () => ({}),
  }
})

jest.mock('leaflet', () => ({
  divIcon: jest.fn(() => ({})),
}))

jest.mock('react-dom/server', () => ({
  renderToString: jest.fn(() => '<div />'),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
  }),
}))

jest.mock('@mbari/utils', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}))

jest.mock('./MarkerContext', () => ({
  useMarkers: () => ({
    handleMarkerSave: jest.fn(),
    saveMarkerToLayer: jest.fn(),
    removeMarkerFromLayer: jest.fn(),
  }),
}))

import DraggableMarker from './DraggableMarker'

const baseProps = {
  id: '1',
  position: [36.8, -121.9] as [number, number],
  label: 'Test Marker',
  index: 0,
  isSelected: true,
  draggable: false,
}

describe('DraggableMarker write controls', () => {
  it('hides Edit and Delete when write handlers are omitted', () => {
    render(<DraggableMarker {...baseProps} />)

    expect(screen.getAllByText('Test Marker').length).toBeGreaterThan(0)
    expect(screen.getByTitle('Close')).toBeInTheDocument()
    expect(screen.queryByTitle('Edit marker')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete marker')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Save to Map Layers')).not.toBeInTheDocument()
  })

  it('shows Edit and Delete when write handlers are provided', () => {
    render(
      <DraggableMarker
        {...baseProps}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onSaveToLayer={jest.fn()}
      />
    )

    expect(screen.getByTitle('Edit marker')).toBeInTheDocument()
    expect(screen.getByTitle('Delete marker')).toBeInTheDocument()
    expect(screen.getByTitle('Save to Map Layers')).toBeInTheDocument()
    expect(screen.getByTitle('Close')).toBeInTheDocument()
  })

  it('notifies parent when edit mode changes via onEditStateChange', () => {
    const onEditStateChange = jest.fn()
    render(
      <DraggableMarker
        {...baseProps}
        onEdit={jest.fn()}
        onEditStateChange={onEditStateChange}
      />
    )

    // Effect notifies parent of current editMode (false on mount).
    expect(onEditStateChange).toHaveBeenCalledWith(false)
  })
})
