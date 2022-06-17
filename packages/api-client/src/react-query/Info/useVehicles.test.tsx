import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useVehicles } from './useVehicles'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: [
    { vehicleName: 'ahi', color: '#FF9900' },
    { vehicleName: 'aku', color: '#CC33FF' },
    { vehicleName: 'brizo', color: '#f4ba0c' },
    { vehicleName: 'daphne', color: '#FF9900' },
    { vehicleName: 'galene', color: '#CC33FF' },
    { vehicleName: 'makai', color: '#FF0000' },
    { vehicleName: 'melia', color: '#FF0000' },
    { vehicleName: 'mesobot', color: '#FF0000' },
    { vehicleName: 'opah', color: '#CC33FF' },
    { vehicleName: 'polaris', color: '#FF0000' },
    { vehicleName: 'pontus', color: '#BD9782' },
    { vehicleName: 'sim', color: '#FF0000' },
    { vehicleName: 'stella', color: '#FF0000' },
    { vehicleName: 'tethys', color: '#CC33FF' },
    { vehicleName: 'triton', color: '#f4ba0c' },
  ],
}

const server = setupServer(
  rest.get('/info/vehicles', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehicleList: React.FC = () => {
  const query = useVehicles({
    refresh: 'y',
  })
  return query.isLoading ? null : (
    <div data-testid="result">
      {query.data?.[0].vehicleName ?? 'Not logged in'}
    </div>
  )
}

describe('useVehicles', () => {
  it('should render the vehicle names', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehicleList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result[0].vehicleName)
    })

    expect(
      screen.queryByText(mockResponse.result[0].vehicleName)
    ).toHaveTextContent(mockResponse.result[0].vehicleName)
  })
})
