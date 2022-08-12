import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useStations } from './useStations'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Map/getStations.test'

const server = setupServer(
  rest.get('/map/layers/stations', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockStation: React.FC = () => {
  const query = useStations()

  return query.isLoading ? null : (
    <div>
      <span data-testid="name">{query.data?.[0].name ?? 'Loading'}</span>
    </div>
  )
}

describe('useStations', () => {
  it('should display the station name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockStation />
      </MockProviders>
    )
    const name = mockResponse[0].name
    await waitFor(() => {
      return screen.getByText(name)
    })

    expect(screen.getByTestId('name')).toHaveTextContent(name)
  })
})
