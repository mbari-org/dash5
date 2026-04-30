/**
 * @jest-environment jsdom
 */

// ---------------------------------------------------------------------------
// Module mocks — jest.mock is hoisted above imports, so these run first.
// ---------------------------------------------------------------------------

// Captures the latest observer callback and instance methods so tests can
// drive them directly without relying on DOM events.
// ---------------------------------------------------------------------------
// Imports must come after jest.mock declarations
// ---------------------------------------------------------------------------
import { act, renderHook } from '@testing-library/react'
import { useResizeObserver } from './useResizeObserver'

let latestDisconnect: jest.Mock
let latestCancel: jest.Mock
let triggerResize: (width: number, height: number) => void

jest.mock('resize-observer-polyfill', () =>
  jest
    .fn()
    .mockImplementation(
      (cb: (entries: Partial<ResizeObserverEntry>[]) => void) => {
        let observedEl: Element | null = null
        latestDisconnect = jest.fn()

        triggerResize = (width: number, height: number) => {
          cb([
            {
              contentBoxSize: [{ inlineSize: width, blockSize: height }],
              contentRect: { width, height } as DOMRectReadOnly,
              target: observedEl!,
            },
          ])
        }

        return {
          observe: jest.fn((el: Element) => {
            observedEl = el
          }),
          unobserve: jest.fn(),
          disconnect: (...args: unknown[]) => latestDisconnect(...args),
        }
      }
    )
)

// Make throttle call through immediately so tests don't need fake timers.
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  throttle: (fn: (...args: unknown[]) => unknown) => {
    latestCancel = jest.fn()
    const passThrough: any = (...args: unknown[]) => fn(...args)
    passThrough.cancel = (...args: unknown[]) => latestCancel(...args)
    passThrough.flush = jest.fn()
    return passThrough
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithDiv(wait?: number) {
  const divRef = { current: document.createElement('div') }
  return renderHook(
    ({ w }: { w?: number }) => useResizeObserver({ element: divRef, wait: w }),
    { initialProps: { w: wait } }
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useResizeObserver', () => {
  it('starts with zero size', () => {
    const { result } = renderWithDiv()
    expect(result.current.size).toEqual({ width: 0, height: 0 })
  })

  it('updates size when the observer fires', () => {
    const { result } = renderWithDiv()
    act(() => triggerResize(800, 600))
    expect(result.current.size).toEqual({ width: 800, height: 600 })
  })

  it('does not update size when dimensions are unchanged (no spurious re-renders)', () => {
    const { result } = renderWithDiv()
    act(() => triggerResize(800, 600))
    const sizeBefore = result.current.size
    act(() => triggerResize(800, 600))
    // Functional setState returns the same object reference when nothing changed
    expect(result.current.size).toBe(sizeBefore)
  })

  it('continues to report correct size after multiple resize events', () => {
    const { result } = renderWithDiv()
    act(() => triggerResize(400, 300))
    expect(result.current.size).toEqual({ width: 400, height: 300 })
    act(() => triggerResize(1024, 768))
    expect(result.current.size).toEqual({ width: 1024, height: 768 })
  })

  it('disconnects unconditionally on unmount (ref may be null by then)', () => {
    const { unmount } = renderWithDiv()
    const spy = latestDisconnect
    unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('cancels any pending throttled invocation on unmount', () => {
    const { unmount } = renderWithDiv()
    const spy = latestCancel
    unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('disconnects the previous observer before creating a new one when wait changes', () => {
    const { rerender } = renderWithDiv(100)
    const firstDisconnect = latestDisconnect
    rerender({ w: 200 })
    expect(firstDisconnect).toHaveBeenCalled()
  })
})
