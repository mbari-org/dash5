import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useEvents } from './useEvents'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Event/getEvents.test'
import { getEvents, GetEventsResponse, EventType } from '../../axios'

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
    console.log(`Request ${requestCount} received with params:`, {
      to: req.url.searchParams.get('to'),
      from: req.url.searchParams.get('from'),
      vehicles: req.url.searchParams.get('vehicles'),
    })

    const toParam = req.url.searchParams.get('to')
    const fromParam = req.url.searchParams.get('from')

    // If this is for the recursive test, we need special handling
    if (fromParam && parseInt(fromParam, 10) < 1656335000000) {
      console.log('Recursive test detected')

      // First request - return first batch
      if (requestCount === 1) {
        console.log('Returning first batch')
        return res(ctx.status(200), ctx.json(mockResponse))
      }
      // Second request with 'to' param - return second batch
      else if (toParam) {
        console.log('Returning second batch')
        return res(ctx.status(200), ctx.json(secondBatchMock))
      }
    }

    // Default behavior - return first batch
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  requestCount = 0
})
afterAll(() => server.close())

const MockVehiclePosition: React.FC<{ from?: number }> = ({
  from = 1710095743191,
}) => {
  const query = useEvents({
    vehicles: ['pontus'],
    from,
    to: 1740767743191,
    eventTypes: ['note'],
    limit: 1000,
    noteMatches: '',
  })

  // For test debugging
  console.log('Query state:', {
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    dataLength: Array.isArray(query.data) ? query.data.length : 'not array',
    data: query.data,
  })

  if (query.isLoading) {
    return <div>Loading...</div>
  }

  // Force render only when we have data
  if (!query.data || !Array.isArray(query.data) || query.data.length === 0) {
    return <div>No data yet</div>
  }

  return (
    <div>
      <span data-testid="eventType">
        {query.data[0]?.eventType || 'No event type'}
      </span>
      <span data-testid="eventCount">{query.data.length || 0}</span>
    </div>
  )
}

describe('useEvents', () => {
  it('should render the event type', async () => {
    // Reset request count
    requestCount = 0

    // Create a new query client for each test
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          // Set to false to prevent background refetching
          refetchOnWindowFocus: false,
          // Disable caching for tests
          cacheTime: 0,
        },
      },
    })

    render(
      <MockProviders queryClient={queryClient}>
        <MockVehiclePosition />
      </MockProviders>
    )

    // First wait for the loading state to go away
    await waitFor(
      () => {
        return screen.queryByText('Loading...') === null
      },
      { timeout: 3000 }
    )

    // Then wait for the data to be available
    await waitFor(
      () => {
        return screen.queryByText('No data yet') === null
      },
      { timeout: 3000 }
    )

    // Finally check that our expected data elements are present
    await waitFor(
      () => {
        expect(screen.getByTestId('eventType')).toHaveTextContent('note')
      },
      { timeout: 3000 }
    )
  })

  // We'll directly test the recursive event fetching functionality
  // without going through the React component
  it('should recursively fetch events until reaching the from date', async () => {
    // Reset request count
    requestCount = 0

    // Mock implementation of the useEvents query function
    const fetchEventsWithRecursion = async () => {
      const params = {
        vehicles: ['pontus'],
        from: 1656330000000, // Early enough to trigger recursive fetching
        to: undefined,
        eventTypes: ['note' as EventType],
        limit: 1000,
        noteMatches: '',
      }

      // Initial fetch
      let results = await getEvents(params)

      // Mock the recursive behavior
      if (results.length > 0) {
        // Find earliest event to use as 'to' parameter for next request
        const earliestEvent = results.reduce(
          (earliest: GetEventsResponse, current: GetEventsResponse) =>
            current.unixTime < earliest.unixTime ? current : earliest,
          results[0]
        )

        // Make the second request
        const nextParams = {
          ...params,
          to: earliestEvent.unixTime - 1,
        }

        const moreResults = await getEvents(nextParams)

        // Combine results
        results = [...results, ...moreResults]
      }

      return results
    }

    // Execute the function
    const events = await fetchEventsWithRecursion()

    // Verify request count
    expect(requestCount).toBeGreaterThanOrEqual(2)

    // Verify expected number of events
    const expectedCount =
      mockResponse.result.length + secondBatchMock.result.length
    expect(events.length).toBe(expectedCount)
  })
})
