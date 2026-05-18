import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useElevator } from './useGoogleElevator'

// The global `google.maps` mock is set up in jest/setup.js.
// elevationService is mocked below so tests can control when the Promise
// resolves/rejects without touching the real singleton.
jest.mock('./elevationService', () => {
  let resolvers: Array<(svc: unknown) => void> = []
  let rejecters: Array<(err: unknown) => void> = []

  const __resolveAll = (svc = {}) => {
    resolvers.forEach((r) => r(svc))
    resolvers = []
    rejecters = []
  }
  const __rejectAll = (err = new Error('unavailable')) => {
    rejecters.forEach((r) => r(err))
    resolvers = []
    rejecters = []
  }
  // Drop any pending (unresolved/unrejected) promises from a previous test so
  // they can't bleed across test boundaries.
  const __reset = () => {
    resolvers = []
    rejecters = []
  }

  return {
    getElevationService: jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolvers.push(resolve)
          rejecters.push(reject)
        })
    ),
    getCachedElevation: jest.fn().mockResolvedValue(null),
    __resolveAll,
    __rejectAll,
    __reset,
  }
})

const elevationService = jest.requireMock('./elevationService') as {
  getElevationService: jest.Mock
  __resolveAll: (svc?: unknown) => void
  __rejectAll: (err?: unknown) => void
  __reset: () => void
}

beforeEach(() => {
  elevationService.getElevationService.mockClear()
  elevationService.__reset()
})

afterEach(() => {
  // Drain any outstanding promises so they don't leak into later tests.
  elevationService.__reset()
})

test('starts with elevationAvailable null', () => {
  const { result } = renderHook(() => useElevator())
  expect(result.current.elevationAvailable).toBeNull()
})

test('sets elevationAvailable true when service resolves', async () => {
  const { result } = renderHook(() => useElevator())

  await act(async () => {
    elevationService.__resolveAll({})
  })

  expect(result.current.elevationAvailable).toBe(true)
})

test('sets elevationAvailable false when service rejects', async () => {
  const { result } = renderHook(() => useElevator())

  await act(async () => {
    elevationService.__rejectAll(new Error('no maps'))
  })

  expect(result.current.elevationAvailable).toBe(false)
})

test('does not update state after unmount (cancelled flag)', async () => {
  const { result, unmount } = renderHook(() => useElevator())

  // Unmount before the service resolves — the cancelled flag should prevent
  // any setState call from firing.
  unmount()

  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  await act(async () => {
    elevationService.__resolveAll({})
  })

  // React logs "Can't perform a React state update on an unmounted component"
  // (or similar) via console.error. Check every argument across all calls.
  const allArgs = consoleError.mock.calls.flat()
  const hasStateWarning = allArgs.some(
    (arg) => typeof arg === 'string' && /state update/i.test(arg)
  )
  expect(hasStateWarning).toBe(false)

  consoleError.mockRestore()

  // The rendered state should remain null since setState was never called.
  expect(result.current.elevationAvailable).toBeNull()
})
