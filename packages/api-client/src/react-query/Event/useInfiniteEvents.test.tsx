import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useInfiniteEvents } from './useInfiniteEvents'
import { mockResponse } from '../../axios/Event/getEvents.test'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockEventsList: React.FC = () => {
  const { data, isLoading } = useInfiniteEvents({
    vehicles: ['pontus'],
    from: 1656435000000,
    to: 1656437000000,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {data?.pages?.[0]?.map((event) => (
        <div key={event.eventId} data-testid={`event-${event.eventId}`}>
          <div data-testid={`vehicle-${event.eventId}`}>
            {event.vehicleName}
          </div>
          <div data-testid={`note-${event.eventId}`}>{event.note}</div>
          <div data-testid={`user-${event.eventId}`}>{event.user}</div>
        </div>
      ))}
    </div>
  )
}

describe('useInfiniteEvents', () => {
  it('should load and display events from the API', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockEventsList />
      </MockProviders>
    )

    await waitFor(() => {
      return screen.getByTestId('event-16932998')
    })

    const firstEventId = 16932998
    expect(screen.getByTestId(`vehicle-${firstEventId}`)).toHaveTextContent(
      'pontus'
    )
    expect(screen.getByTestId(`user-${firstEventId}`)).toHaveTextContent(
      'Brett Hobson'
    )
    expect(screen.getByTestId(`note-${firstEventId}`)).toHaveTextContent(
      'was going to skip the B&T and compass cal'
    )

    const secondEventId = 16932853
    expect(screen.getByTestId(`event-${secondEventId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`user-${secondEventId}`)).toHaveTextContent(
      'Brian Kieft'
    )
    expect(screen.getByTestId(`note-${secondEventId}`)).toHaveTextContent(
      'Signing in as PIC'
    )
  })
})
