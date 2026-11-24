import '@testing-library/jest-dom'
import React from 'react'
import { render, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { TethysApiContext, COMMAND_QUEUE_QUERY_KEY } from '@mbari/api-client'
import { useTethysSubscription } from '../lib/useWebSocketListeners'

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

  test('invalidates command queue queries on ResourceUpdated commandQueue', () => {
    const queryClient = new QueryClient()
    // Seed a cached entry so we can observe it being invalidated.
    const queueKey = [...COMMAND_QUEUE_QUERY_KEY, 'sim']
    queryClient.setQueryData(queueKey, { sim: [] })

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
          eventName: 'ResourceUpdated',
          resource: 'commandQueue',
          key: 'sim',
        }),
      } as MessageEvent)
    })

    // The cached entry should now be stale (invalidated).
    const state = queryClient.getQueryState(queueKey)
    expect(state?.isInvalidated).toBe(true)
  })
})
