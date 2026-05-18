import { renderHook, act } from '@testing-library/react'
import { useSidebarSizes } from '../lib/useSidebarSizes'

const STORAGE_KEY = 'sidebar:rightPct'

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY)
  jest.useFakeTimers()
})
afterEach(() => {
  localStorage.removeItem(STORAGE_KEY)
  jest.useRealTimers()
})

test('returns default [75, 25] when nothing is stored', () => {
  const { result } = renderHook(() => useSidebarSizes())
  expect(result.current.defaultSizes).toEqual([75, 25])
})

test('restores stored right-pane percentage as defaultSizes on mount', () => {
  localStorage.setItem(STORAGE_KEY, '40.00')
  const { result } = renderHook(() => useSidebarSizes())
  expect(result.current.defaultSizes[1]).toBeCloseTo(40, 1)
  expect(result.current.defaultSizes[0]).toBeCloseTo(60, 1)
})

test('onSidebarChange saves the right-pane percentage after debounce', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([900, 300])
    jest.runAllTimers()
  })
  const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '')
  expect(stored).toBeCloseTo(25, 1)
})

test('onSidebarChange does not write immediately — debounces the write', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([900, 300])
    // Timer has not fired yet
  })
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  act(() => jest.runAllTimers())
  expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
})

test('onSidebarChange updates the stored value when the user resizes', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([800, 400])
    jest.runAllTimers()
  })
  expect(parseFloat(localStorage.getItem(STORAGE_KEY) ?? '')).toBeCloseTo(
    33.33,
    1
  )
})

test('onSidebarChange skips writing out-of-range values (< 5%)', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([990, 10]) // ~1% right — out of range
    jest.runAllTimers()
  })
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('onSidebarChange skips writing out-of-range values (> 95%)', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([10, 990]) // ~99% right — out of range
    jest.runAllTimers()
  })
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('ignores stored values outside the 5–95 % safety range on mount', () => {
  localStorage.setItem(STORAGE_KEY, '2.00')
  const { result } = renderHook(() => useSidebarSizes())
  expect(result.current.defaultSizes).toEqual([75, 25])
})

test('accepts boundary values of exactly 5% and 95%', () => {
  localStorage.setItem(STORAGE_KEY, '5.00')
  const { result: r5 } = renderHook(() => useSidebarSizes())
  expect(r5.current.defaultSizes[1]).toBeCloseTo(5, 1)

  localStorage.setItem(STORAGE_KEY, '95.00')
  const { result: r95 } = renderHook(() => useSidebarSizes())
  expect(r95.current.defaultSizes[1]).toBeCloseTo(95, 1)
})

test('flushes the pending write synchronously on unmount (navigate-away scenario)', () => {
  const { result, unmount } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([700, 300]) // 30% right, timer not yet fired
  })
  // Timer has not fired — nothing written yet
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  // Unmount (simulate page navigation within debounce window)
  unmount()
  // Pending value should have been flushed synchronously
  const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '')
  expect(stored).toBeCloseTo(30, 1)
})

test('onSidebarChange is a stable reference (does not change between renders)', () => {
  const { result, rerender } = renderHook(() => useSidebarSizes())
  const first = result.current.onSidebarChange
  rerender()
  expect(result.current.onSidebarChange).toBe(first)
})
