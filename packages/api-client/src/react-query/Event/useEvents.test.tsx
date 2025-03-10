import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useEvents } from './useEvents'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Event/getEvents.test'

// Create a second batch of mock data with earlier timestamps
const secondBatchMock = {
  result: [
    {
      eventId: 16932001,
      vehicleName: 'pontus',
      unixTime: 1656336678089, // Earlier than the first batch
      isoTime: '2022-06-27T17:17:58.089Z',
      eventType: 'note',
      state: 0,
      user: 'John Doe',
      note: 'Earlier event',
    },
    {
      eventId: 16932002,
      vehicleName: 'pontus',
      unixTime: 1656335451959, // Earlier than the first batch
      isoTime: '2022-06-27T16:57:31.959Z',
      eventType: 'note',
      state: 0,
      user: 'Jane Smith',
      note: 'Another earlier event',
    },
  ],
}

// Use a variable to track request count for testing recursive fetching
let requestCount = 0

const server = setupServer(
  // Mock the info endpoint to prevent console errors
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: {} }))
  }),

  rest.get('/events', (req, res, ctx) => {
    requestCount++
    const toParam = req.url.searchParams.get('to')

    // If this is the first request or no 'to' param is provided, return the first batch
    if (requestCount === 1 || !toParam) {
      return res(ctx.status(200), ctx.json(mockResponse))
    }
    // Otherwise return the second batch (for recursive requests)
    else {
      return res(ctx.status(200), ctx.json(secondBatchMock))
    }
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  requestCount = 0
})
afterAll(() => server.close())

const MockVehiclePosition: React.FC<{ from?: string }> = ({ from = '123' }) => {
  const query = useEvents({
    vehicles: ['pontus'],
    from,
    to: '',
    eventTypes: ['note'],
    limit: 1000,
    noteMatches: '',
  })

  if (query.isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <span data-testid="eventType">
        {query.data?.[0]?.eventType || 'No event type'}
      </span>
      <span data-testid="eventCount">{query.data?.length || 0}</span>
    </div>
  )
}

describe('useEvents', () => {
  it('should render the event type', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <MockProviders queryClient={queryClient}>
        <MockVehiclePosition />
      </MockProviders>
    )

    // Wait for loading to finish
    await waitFor(() => {
      return screen.queryByText('Loading...') === null
    })

    // Check data is rendered correctly
    expect(screen.getByTestId('eventType')).toHaveTextContent('note')
  })

  it('should recursively fetch events until reaching the from date', async () => {
    // Set the from date to a timestamp that would require multiple requests
    const fromDate = new Date(1656335000000).toISOString() // Earlier than the second batch

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <MockProviders queryClient={queryClient}>
        <MockVehiclePosition from={fromDate} />
      </MockProviders>
    )

    // Wait for loading to finish
    await waitFor(() => {
      return screen.queryByText('Loading...') === null
    })

    // Expect that we've made at least 2 requests to get all the data
    expect(requestCount).toBeGreaterThanOrEqual(2)

    // Expect that the total count of events is the sum of both batches
    const expectedCount =
      mockResponse.result.length + secondBatchMock.result.length
    await waitFor(() => {
      expect(screen.getByTestId('eventCount').textContent).toBe(
        expectedCount.toString()
      )
    })
  })
})
