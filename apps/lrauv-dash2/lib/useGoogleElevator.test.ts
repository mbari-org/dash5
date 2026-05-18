import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useElevator } from './useGoogleElevator'

// The global `google.maps` mock is set up in jest/setup.js.
// Reset the module-level singleton between tests so each test starts fresh.
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
  }
})

const elevationService = jest.requireMock('./elevationService') as {
  getElevationService: jest.Mock
  __resolveAll: (svc?: unknown) => void
  __rejectAll: (err?: unknown) => void
}

beforeEach(() => {
  elevationService.getElevationService.mockClear()
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

  // Unmount before the service resolves
  unmount()

  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  await act(async () => {
    elevationService.__resolveAll({})
  })

  // React should NOT log a "Can't perform state update on unmounted component"
  // warning because the cancelled flag prevents the setState call.
  expect(consoleError).not.toHaveBeenCalledWith(
    expect.stringMatching(/state update/i)
  )
  consoleError.mockRestore()

  // The state should not have changed (result is from before unmount)
  expect(result.current.elevationAvailable).toBeNull()
})
