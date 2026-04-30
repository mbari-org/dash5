/**
 * @jest-environment jsdom
 *
 * jest.mock() factories are hoisted above all imports and let-bindings.
 * Any variable referenced from inside a factory must be prefixed with
 * "mock" — Jest allows only those names to cross the hoist boundary safely.
 */

// ---------------------------------------------------------------------------
// Hoist-safe mock state  (must be prefixed with "mock" per Jest rules)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Imports must follow jest.mock declarations
// ---------------------------------------------------------------------------
import { act, renderHook } from '@testing-library/react'
import { useResizeObserver } from './useResizeObserver'

let mockDisconnect = jest.fn()
let mockCancel = jest.fn()
// Populated by the ResizeObserver mock constructor; undefined until first render
let mockTriggerResize: ((width: number, height: number) => void) | undefined

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('resize-observer-polyfill', () =>
  jest
    .fn()
    .mockImplementation(
      (cb: (entries: Partial<ResizeObserverEntry>[]) => void) => {
        let observedEl: Element | null = null
        // Fresh disconnect spy per observer instance; captured via module-scope
        // mock-prefixed variable so tests can reference the latest instance.
        mockDisconnect = jest.fn()

        mockTriggerResize = (width: number, height: number) => {
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
          disconnect: (...args: unknown[]) => mockDisconnect(...args),
        }
      }
    )
)

// Make throttle call through immediately so tests don't need fake timers.
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  throttle: (fn: (...args: unknown[]) => unknown) => {
    mockCancel = jest.fn()
    const passThrough: any = (...args: unknown[]) => fn(...args)
    passThrough.cancel = (...args: unknown[]) => mockCancel(...args)
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

function fireResize(width: number, height: number) {
  act(() => {
    if (!mockTriggerResize)
      throw new Error('ResizeObserver not yet instantiated')
    mockTriggerResize(width, height)
  })
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
    fireResize(800, 600)
    expect(result.current.size).toEqual({ width: 800, height: 600 })
  })

  it('does not trigger re-renders when dimensions are unchanged', () => {
    const { result } = renderWithDiv()
    fireResize(800, 600)
    const sizeBefore = result.current.size
    fireResize(800, 600)
    // Functional setState must return the same reference when nothing changed
    expect(result.current.size).toBe(sizeBefore)
  })

  it('continues to report correct size after multiple resize events', () => {
    const { result } = renderWithDiv()
    fireResize(400, 300)
    expect(result.current.size).toEqual({ width: 400, height: 300 })
    fireResize(1024, 768)
    expect(result.current.size).toEqual({ width: 1024, height: 768 })
  })

  it('disconnects unconditionally on unmount (ref may be null by then)', () => {
    const { unmount } = renderWithDiv()
    const spy = mockDisconnect
    unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('cancels any pending throttled invocation on unmount', () => {
    const { unmount } = renderWithDiv()
    const spy = mockCancel
    unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('disconnects the previous observer before creating a new one when wait changes', () => {
    const { rerender } = renderWithDiv(100)
    const firstDisconnect = mockDisconnect
    rerender({ w: 200 })
    expect(firstDisconnect).toHaveBeenCalled()
  })
})
