import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useCommandQueue } from './useCommandQueue'

const mockResponse = {
  result: {
    sim: [
      {
        refEventId: 11111,
        via: { medium: 'cellsat', timeout: 60 },
        queuedTimeMillis: 1700000000000,
        dispatched: false,
      },
      {
        refEventId: 22222,
        via: { medium: 'cellsat', timeout: 60 },
        queuedTimeMillis: 1700000010000,
        dispatched: true,
        servedTimeMillis: 1700000015000,
      },
    ],
  },
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/commands/queue', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const Probe: React.FC = () => {
  const { dispatchedEventIds, isLoading } = useCommandQueue(['sim'])
  if (isLoading) return <div>loading</div>
  const entry11111 = dispatchedEventIds.get(11111)
  const entry22222 = dispatchedEventIds.get(22222)
  return (
    <div>
      <span data-testid="11111-dispatched">
        {String(entry11111?.dispatched ?? 'missing')}
      </span>
      <span data-testid="22222-dispatched">
        {String(entry22222?.dispatched ?? 'missing')}
      </span>
    </div>
  )
}

describe('useCommandQueue', () => {
  it('returns a dispatchedEventIds map keyed by refEventId', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <Probe />
      </MockProviders>
    )
    await waitFor(() => screen.getByTestId('11111-dispatched'))
    expect(screen.getByTestId('11111-dispatched')).toHaveTextContent('false')
    expect(screen.getByTestId('22222-dispatched')).toHaveTextContent('true')
  })

  it('returns an empty map when no vehicles provided', async () => {
    const EmptyProbe: React.FC = () => {
      const { dispatchedEventIds } = useCommandQueue([])
      return <div data-testid="size">{dispatchedEventIds.size}</div>
    }
    render(
      <MockProviders queryClient={new QueryClient()}>
        <EmptyProbe />
      </MockProviders>
    )
    await waitFor(() => screen.getByTestId('size'))
    expect(screen.getByTestId('size')).toHaveTextContent('0')
  })
})
