import { renderHook, act } from '@testing-library/react'
import { useSidebarSizes } from '../lib/useSidebarSizes'

const STORAGE_KEY = 'sidebar:rightPct'

beforeEach(() => localStorage.removeItem(STORAGE_KEY))
afterEach(() => localStorage.removeItem(STORAGE_KEY))

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

test('onSidebarChange saves the right-pane percentage to localStorage', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => {
    result.current.onSidebarChange([900, 300])
  })
  const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '')
  expect(stored).toBeCloseTo(25, 1)
})

test('onSidebarChange updates the stored value when the user resizes', () => {
  const { result } = renderHook(() => useSidebarSizes())
  act(() => result.current.onSidebarChange([800, 400]))
  expect(parseFloat(localStorage.getItem(STORAGE_KEY) ?? '')).toBeCloseTo(
    33.33,
    1
  )
})

test('ignores stored values outside the 5–95 % safety range', () => {
  localStorage.setItem(STORAGE_KEY, '2.00')
  const { result } = renderHook(() => useSidebarSizes())
  expect(result.current.defaultSizes).toEqual([75, 25])
})

test('onSidebarChange is a stable reference (does not change between renders)', () => {
  const { result, rerender } = renderHook(() => useSidebarSizes())
  const first = result.current.onSidebarChange
  rerender()
  expect(result.current.onSidebarChange).toBe(first)
})
