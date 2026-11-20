import '@testing-library/jest-dom'
import React from 'react'
import { render, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { TethysApiContext } from '@mbari/api-client'
import {
  useTethysSubscription,
  XEVENT_BUFFER_KEY,
} from '../lib/useWebSocketListeners'

// Mock WebSocket globally
class MockWebSocket {
  static instances: MockWebSocket[] = []
  url: string
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  sentMessages: string[] = []

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }
  send(data: string) {
    this.sentMessages.push(data)
  }
  close() {}
}

const originalWebSocket = global.WebSocket
const originalWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
const originalAppVersion = process.env.NEXT_PUBLIC_APP_VERSION

beforeEach(() => {
  MockWebSocket.instances = []
  // @ts-expect-error mocking global WebSocket
  global.WebSocket = MockWebSocket
  process.env.NEXT_PUBLIC_WEBSOCKET_URL = 'wss://okeanids.mbari.org/ws/'
  process.env.NEXT_PUBLIC_APP_VERSION = '5.1.31'
})

afterEach(() => {
  // @ts-expect-error restoring global WebSocket
  global.WebSocket = originalWebSocket
  process.env.NEXT_PUBLIC_WEBSOCKET_URL = originalWsUrl
  process.env.NEXT_PUBLIC_APP_VERSION = originalAppVersion
})

const makeWrapper = (token: string | null, email: string | null) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient()
    return (
      <QueryClientProvider client={queryClient}>
        <TethysApiContext.Provider
          value={
            {
              token,
              profile: email
                ? { email, firstName: 'Test', lastName: 'User' }
                : null,
              axiosInstance: {} as any,
            } as any
          }
        >
          {children}
        </TethysApiContext.Provider>
      </QueryClientProvider>
    )
  }
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

const Probe: React.FC = () => {
  useTethysSubscription()
  return null
}

describe('useTethysSubscription', () => {
  test('connects to NEXT_PUBLIC_WEBSOCKET_URL without token in URL', () => {
    const wrapper = makeWrapper('test-token-123', 'user@mbari.org')
    render(<Probe />, { wrapper })

    expect(MockWebSocket.instances).toHaveLength(1)
    expect(MockWebSocket.instances[0].url).toBe('wss://okeanids.mbari.org/ws')
  })

  test('strips trailing slashes from base URL', () => {
    process.env.NEXT_PUBLIC_WEBSOCKET_URL = 'wss://okeanids.mbari.org/ws//'
    const wrapper = makeWrapper('test-token-123', 'user@mbari.org')
    render(<Probe />, { wrapper })

    expect(MockWebSocket.instances[0].url).toBe('wss://okeanids.mbari.org/ws')
  })

  test('sends auth frame with token, tduiv, and aem on open', () => {
    const wrapper = makeWrapper('test-token-123', 'user@mbari.org')
    render(<Probe />, { wrapper })

    const ws = MockWebSocket.instances[0]
    ws.onopen?.()

    expect(ws.sentMessages).toHaveLength(1)
    const frame = JSON.parse(ws.sentMessages[0])
    expect(frame).toEqual({
      auth: 'test-token-123',
      tduiv: '5.1.31',
      aem: 'user@mbari.org',
    })
  })

  test('does not connect when token is missing', () => {
    const wrapper = makeWrapper(null, 'user@mbari.org')
    render(<Probe />, { wrapper })

    expect(MockWebSocket.instances).toHaveLength(0)
  })

  test('does not connect when profile email is missing', () => {
    const wrapper = makeWrapper('test-token-123', null)
    render(<Probe />, { wrapper })

    expect(MockWebSocket.instances).toHaveLength(0)
  })

  test('appends XEvent position to matching TrackDB platform cache entry', () => {
    const queryClient = new QueryClient()

    // Seed a cached platform positions entry for "rcsn_sim"
    const platformKey = [
      'trackdb',
      'platforms',
      'platform-abc',
      'positions',
      20,
      undefined,
      undefined,
    ]
    queryClient.setQueryData(platformKey, {
      platformId: 'platform-abc',
      platformName: 'rcsn_sim',
      positions: [{ timeMs: 1700000000000, lat: 36.6, lon: -122.0 }],
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <TethysApiContext.Provider
          value={
            {
              token: 'test-token-123',
              profile: {
                email: 'user@mbari.org',
                firstName: 'T',
                lastName: 'U',
              },
              axiosInstance: {} as any,
            } as any
          }
        >
          {children}
        </TethysApiContext.Provider>
      </QueryClientProvider>
    )
    Wrapper.displayName = 'TestWrapper'

    render(<Probe />, { wrapper: Wrapper })
    const ws = MockWebSocket.instances[0]
    ws.onopen?.()

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          eventName: 'XEvent',
          appName: 'odss2dash',
          payload: {
            assetName: 'rcsn_sim',
            position: { timeMs: 1700000060000, lat: 36.7, lon: -122.1 },
            typeName: 'ship',
          },
        }),
      } as MessageEvent)
    })

    const updated = queryClient.getQueryData<{
      positions: { timeMs: number; lat: number; lon: number }[]
    }>(platformKey)
    expect(updated?.positions).toHaveLength(2)
    expect(updated?.positions[1]).toEqual({
      timeMs: 1700000060000,
      lat: 36.7,
      lon: -122.1,
    })

    // XEvent buffer should also be written so positions survive HTTP refetch.
    const buffer = queryClient.getQueryData<
      { timeMs: number; lat: number; lon: number }[]
    >(['trackdb', XEVENT_BUFFER_KEY, 'platform-abc'])
    expect(buffer).toHaveLength(1)
    expect(buffer?.[0]).toEqual({
      timeMs: 1700000060000,
      lat: 36.7,
      lon: -122.1,
    })
  })

  test('writes XEvent buffer when platform query exists but is still pending (no response yet)', () => {
    const queryClient = new QueryClient()
    // Seed a position query key with no data (simulates in-flight initial fetch)
    const platformKey = [
      'trackdb',
      'platforms',
      'mongo-id-pending',
      'positions',
      20,
      undefined,
      undefined,
    ]
    queryClient.setQueryData(platformKey, undefined)

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <TethysApiContext.Provider
          value={
            {
              token: 'test-token-123',
              profile: {
                email: 'user@mbari.org',
                firstName: 'T',
                lastName: 'U',
              },
              axiosInstance: {} as any,
            } as any
          }
        >
          {children}
        </TethysApiContext.Provider>
      </QueryClientProvider>
    )
    Wrapper.displayName = 'TestWrapper'

    render(<Probe />, { wrapper: Wrapper })
    const ws = MockWebSocket.instances[0]
    ws.onopen?.()

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          eventName: 'XEvent',
          appName: 'odss2dash',
          payload: {
            assetId: 'mongo-id-pending',
            position: { timeMs: 1700000060000, lat: 36.7, lon: -122.1 },
          },
        }),
      } as MessageEvent)
    })

    // Main cache should still be undefined (no response yet)
    const main = queryClient.getQueryData(platformKey)
    expect(main).toBeUndefined()

    // XEvent buffer should be written so PlatformPath can merge on mount
    const buffer = queryClient.getQueryData<
      { timeMs: number; lat: number; lon: number }[]
    >(['trackdb', XEVENT_BUFFER_KEY, 'mongo-id-pending'])
    expect(buffer).toHaveLength(1)
    expect(buffer?.[0]).toEqual({
      timeMs: 1700000060000,
      lat: 36.7,
      lon: -122.1,
    })
  })

  test('does not throw and does not invalidate when XEvent has no matching platform in cache', () => {
    const queryClient = new QueryClient()
    // Seed a position query — it should NOT be invalidated
    const posKey = ['trackdb', 'platforms', 'p1', 'positions', 20]
    queryClient.setQueryData(posKey, {
      platformId: 'p1',
      platformName: 'other_ship',
      positions: [],
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <TethysApiContext.Provider
          value={
            {
              token: 'test-token-123',
              profile: {
                email: 'user@mbari.org',
                firstName: 'T',
                lastName: 'U',
              },
              axiosInstance: {} as any,
            } as any
          }
        >
          {children}
        </TethysApiContext.Provider>
      </QueryClientProvider>
    )
    Wrapper.displayName = 'TestWrapper'

    render(<Probe />, { wrapper: Wrapper })
    const ws = MockWebSocket.instances[0]
    ws.onopen?.()

    expect(() => {
      act(() => {
        ws.onmessage?.({
          data: JSON.stringify({
            eventName: 'XEvent',
            payload: {
              assetName: 'unknown_ship',
              position: { timeMs: 1700000000000, lat: 36.0, lon: -122.0 },
            },
          }),
        } as MessageEvent)
      })
    }).not.toThrow()

    // No invalidation — the 10-minute fallback poll handles unknown assets.
    const state = queryClient.getQueryState(posKey)
    expect(state?.isInvalidated).toBe(false)
  })

  test('matches XEvent by assetId and writes to XEVENT_BUFFER_KEY', () => {
    const queryClient = new QueryClient()
    const platformKey = [
      'trackdb',
      'platforms',
      'mongo-id-123',
      'positions',
      20,
      undefined,
      undefined,
    ]
    queryClient.setQueryData(platformKey, {
      platformId: 'mongo-id-123',
      platformName: 'rcsn_sim',
      positions: [{ timeMs: 1700000000000, lat: 36.6, lon: -122.0 }],
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <TethysApiContext.Provider
          value={
            {
              token: 'test-token-123',
              profile: {
                email: 'user@mbari.org',
                firstName: 'T',
                lastName: 'U',
              },
              axiosInstance: {} as any,
            } as any
          }
        >
          {children}
        </TethysApiContext.Provider>
      </QueryClientProvider>
    )
    Wrapper.displayName = 'TestWrapper'

    render(<Probe />, { wrapper: Wrapper })
    const ws = MockWebSocket.instances[0]
    ws.onopen?.()

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          eventName: 'XEvent',
          appName: 'odss2dash',
          payload: {
            assetId: 'mongo-id-123',
            assetName: 'different_name', // assetId should take precedence
            position: { timeMs: 1700000060000, lat: 36.7, lon: -122.1 },
          },
        }),
      } as MessageEvent)
    })

    // Main cache updated
    const updated = queryClient.getQueryData<{
      positions: { timeMs: number; lat: number; lon: number }[]
    }>(platformKey)
    expect(updated?.positions).toHaveLength(2)

    // XEvent buffer written
    const buffer = queryClient.getQueryData<
      { timeMs: number; lat: number; lon: number }[]
    >(['trackdb', XEVENT_BUFFER_KEY, 'mongo-id-123'])
    expect(buffer).toHaveLength(1)
    expect(buffer?.[0]).toEqual({
      timeMs: 1700000060000,
      lat: 36.7,
      lon: -122.1,
    })
  })
})
