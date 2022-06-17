import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useMissionStartedEvent } from './useMissionStartedEvent'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: [
    {
      eventId: 0,
      eventType: 'argoReceive',
      vehicleName: 'string',
      unixTime: 0,
      isoTime: 'string',
      fix: {
        latitude: 0,
        longitude: 0,
      },
      state: 0,
      dataLen: 0,
      refId: 0,
      index: 0,
      component: 'string',
    },
  ],
}

const server = setupServer(
  rest.get('/events/mission-started', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehiclePosition: React.FC = () => {
  const query = useMissionStartedEvent({
    vehicle: 'pontus',
  })
  return query.isLoading ? null : (
    <div>
      <span data-testid="eventType">
        {query.data?.[0].eventType ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useMissionStartedEvent', () => {
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
