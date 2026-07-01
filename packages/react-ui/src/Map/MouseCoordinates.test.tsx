import '@testing-library/jest-dom'
import React from 'react'
import { render, act } from '@testing-library/react'

// --- react-leaflet mocks ---
let capturedMousemoveHandler: ((e: { latlng: L.LatLng }) => void) | null = null

jest.mock('react-leaflet', () => ({
  useMapEvents: (handlers: { mousemove?: (e: unknown) => void }) => {
    capturedMousemoveHandler = handlers.mousemove ?? null
    return null
  },
}))

jest.mock('leaflet/dist/leaflet.css', () => {})

// --- @mbari/utils mock ---
jest.mock('@mbari/utils', () => ({
  useDebouncedEffect: (fn: () => void) => fn(),
}))

// --- helpers ---
const mockLatLng = (lat: number, lng: number) =>
  ({ lat, lng } as unknown as L.LatLng)

const simulateMousemove = (lat: number, lng: number) => {
  act(() => {
    capturedMousemoveHandler?.({ latlng: mockLatLng(lat, lng) })
  })
}

const fireCtrlC = () => {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true })
    )
  })
}

// --- clipboard mock ---
const mockWriteText = jest.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
})

import MouseCoordinates, { isInTextContext } from './MouseCoordinates'

describe('MouseCoordinates — Ctrl+C clipboard guard (fix #751)', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
    capturedMousemoveHandler = null
    // Reset activeElement to body and selection to empty
    jest.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => '',
    } as unknown as Selection)
    Object.defineProperty(document, 'activeElement', {
      value: document.body,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('copies coordinates to clipboard when mouse is over map and no text context is active', () => {
    render(<MouseCoordinates />)
    simulateMousemove(36.80353, -121.77897)
    fireCtrlC()
    expect(mockWriteText).toHaveBeenCalledWith('36.80353, -121.77897')
  })

  it('does NOT copy coordinates when the user has text selected (window.getSelection guard)', () => {
    jest.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'EnableBackseat',
    } as unknown as Selection)
    render(<MouseCoordinates />)
    simulateMousemove(36.80353, -121.77897)
    fireCtrlC()
    expect(mockWriteText).not.toHaveBeenCalled()
  })

  // --- isInTextContext unit tests (element-type guards) ---
  // jsdom doesn't propagate .focus() to document.activeElement reliably, so
  // we test the extracted guard function directly with real DOM elements.

  it('isInTextContext: returns true for a contenteditable element', () => {
    const el = document.createElement('div')
    // jsdom does not implement isContentEditable, so we define it on the instance
    // to simulate what a real browser returns for a contenteditable div.
    Object.defineProperty(el, 'isContentEditable', { get: () => true })
    expect(isInTextContext(el, '')).toBe(true)
  })

  it('isInTextContext: returns true for an <input> element', () => {
    const el = document.createElement('input')
    expect(isInTextContext(el, '')).toBe(true)
  })

  it('isInTextContext: returns true for a <textarea> element', () => {
    const el = document.createElement('textarea')
    expect(isInTextContext(el, '')).toBe(true)
  })

  it('isInTextContext: returns true when selection string is non-empty', () => {
    expect(isInTextContext(document.body, 'EnableBackseat')).toBe(true)
  })

  it('isInTextContext: returns false for a plain div with no selection', () => {
    const el = document.createElement('div')
    expect(isInTextContext(el, '')).toBe(false)
  })

  it('isInTextContext: returns false for null activeElement with no selection', () => {
    expect(isInTextContext(null, '')).toBe(false)
  })

  it('does NOT copy when no mouse coordinates have been recorded yet', () => {
    render(<MouseCoordinates />)
    // no simulateMousemove — formattedCoordinates is empty
    fireCtrlC()
    expect(mockWriteText).not.toHaveBeenCalled()
  })
})
