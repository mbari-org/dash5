import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HandoffSection from './HandoffSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

export const mockResponse = {
  result: [
    {
      eventId: 16932998,
      vehicleName: 'pontus',
      unixTime: 1656436678089,
      isoTime: '2022-06-28T17:17:58.089Z',
      eventType: 'note',
      state: 0,
      user: 'Brett Hobson',
      note: 'was going to skip the B&T and compass cal in an effort to get the show on the road.  Thanks for the help though',
    },
    {
      eventId: 16932853,
      vehicleName: 'pontus',
      unixTime: 1656435451959,
      isoTime: '2022-06-28T16:57:31.959Z',
      eventType: 'note',
      state: 0,
      user: 'Brian Kieft',
      note: 'Signing in as PIC',
    },
    {
      eventId: 16932853,
      vehicleName: 'pontus',
      unixTime: 1656435451959,
      isoTime: '2022-06-28T16:57:31.959Z',
      eventType: 'note',
      state: 0,
      user: 'Shannon Johnson',
      note: 'Signing in as PIC',
    },
  ],
}

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

describe('VehicleList', () => {
  test('should render the component', async () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <HandoffSection vehicleName="pontus" from="" />
        </MockProviders>
      )
    ).not.toThrow()
  })

  test('should render custom handoff messages', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <HandoffSection vehicleName="pontus" from="" />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/Signing in as PIC from previous PIC./i)
    })
    expect(
      screen.getByText(/Signing in as PIC from previous PIC./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Signing in as PIC from Shannon Johnson./i)
    ).toBeInTheDocument()
  })

  test('should not render the add note button if not authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <HandoffSection vehicleName="pontus" from="" />
      </MockProviders>
    )
    expect(screen.queryByText(/add note/i)).not.toBeInTheDocument()
  })

  test('should render the add note button if authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <HandoffSection vehicleName="pontus" from="" authenticated />
      </MockProviders>
    )
    expect(screen.getByText(/add note/i)).toBeInTheDocument()
  })
})
