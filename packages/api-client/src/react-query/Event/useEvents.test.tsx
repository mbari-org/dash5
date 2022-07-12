import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useEvents } from './useEvents'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Event/getEvents.test'

const server = setupServer(
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehiclePosition: React.FC = () => {
  const query = useEvents({
    vehicles: ['pontus'],
    from: '123',
    to: '',
    eventTypes: ['note'],
    limit: 1000,
    noteMatches: '',
  })
  return query.isLoading ? null : (
    <div>
      <span data-testid="eventType">
        {query.data?.[0].eventType ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useEvents', () => {
  it('should render the event type', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehiclePosition />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result[0].eventType)
    })

    expect(screen.getByTestId('eventType')).toHaveTextContent(
      mockResponse.result[0].eventType
    )
  })
})
