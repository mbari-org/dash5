import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'

// Mock react-leaflet so PlatformPath can render without a map context
jest.mock('react-leaflet', () => ({
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Polyline: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="polyline">{children}</div>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  CircleMarker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="circle-marker">{children}</div>
  ),
}))

jest.mock('leaflet', () => ({ divIcon: jest.fn(() => ({})) }))

const mockUsePlatformPositions = jest.fn()
jest.mock('@mbari/api-client', () => ({
  usePlatformPositions: (...args: unknown[]) =>
    mockUsePlatformPositions(...args),
}))

jest.mock('@mbari/utils', () => ({
  createLogger: jest.fn(() => ({ debug: jest.fn(), warn: jest.fn() })),
}))

jest.mock('../lib/useTick', () => ({ useTick: () => Date.now() }))

import { PlatformPath, isTimeoutError } from '../components/PlatformPath'

beforeEach(() => mockUsePlatformPositions.mockReset())

// ─── Pure helper: isTimeoutError ──────────────────────────────────────────────

describe('isTimeoutError', () => {
  it('returns true for error messages containing the word "timeout"', () => {
    expect(isTimeoutError(new Error('timeout of 5000ms exceeded'))).toBe(true)
    expect(isTimeoutError(new Error('TIMEOUT exceeded'))).toBe(true)
    expect(isTimeoutError(new Error('axios timeout error'))).toBe(true)
  })

  it('returns false for "timed out" phrasing (does not contain "timeout")', () => {
    expect(isTimeoutError(new Error('Request timed out'))).toBe(false)
  })

  it('returns false for non-timeout errors', () => {
    expect(
      isTimeoutError(new Error('Request failed with status code 500'))
    ).toBe(false)
    expect(isTimeoutError(new Error('Network Error'))).toBe(false)
    expect(isTimeoutError(new Error('401 Unauthorized'))).toBe(false)
  })

  it('returns false for non-Error values', () => {
    expect(isTimeoutError('timeout string')).toBe(false)
    expect(isTimeoutError(null)).toBe(false)
    expect(isTimeoutError(undefined)).toBe(false)
    expect(isTimeoutError({ message: 'timeout' })).toBe(false)
  })
})

// ─── Rendering behaviour ──────────────────────────────────────────────────────

describe('PlatformPath rendering', () => {
  it('renders nothing while loading', () => {
    mockUsePlatformPositions.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })
    const { container } = render(<PlatformPath platformId="abc" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when an error occurs', () => {
    mockUsePlatformPositions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('timeout of 5000ms exceeded'),
    })
    const { container } = render(<PlatformPath platformId="abc" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when positions array is empty', () => {
    mockUsePlatformPositions.mockReturnValue({
      data: { positions: [] },
      isLoading: false,
      error: null,
    })
    const { container } = render(<PlatformPath platformId="abc" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a polyline when positions are available', () => {
    mockUsePlatformPositions.mockReturnValue({
      data: {
        positions: [
          { timeMs: 1000, lat: 36.0, lon: -122.0 },
          { timeMs: 2000, lat: 36.1, lon: -122.1 },
        ],
      },
      isLoading: false,
      error: null,
    })
    const { getByTestId } = render(
      <PlatformPath platformId="abc" platformName="Test Platform" />
    )
    expect(getByTestId('polyline')).toBeInTheDocument()
  })
})
