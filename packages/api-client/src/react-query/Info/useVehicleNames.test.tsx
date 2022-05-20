import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useVehicleNames } from './useVehicleNames'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: [
    'ahi',
    'aku',
    'brizo',
    'daphne',
    'galene',
    'makai',
    'melia',
    'mesobot',
    'opah',
    'pallas',
    'polaris',
    'pontus',
    'proxima',
    'pyxis',
    'sim',
    'stella',
    'tethys',
    'triton',
  ],
}

const mockAuthResponse = {
  result: {
    email: 'jim@sumocreations.com',
    firstName: 'Jim',
    lastName: 'Jeffers',
    roles: ['operator'],
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKaW0iLCJsYXN0TmFtZSI6IkplZmZlcnMiLCJleHAiOjE2NTM3NzgzODYsImVtYWlsIjoiamltQHN1bW9jcmVhdGlvbnMuY29tIiwicm9sZXMiOlsib3BlcmF0b3IiXX0.iIE60rpDVtL56Kt9p_Zs4MFLaDj03ISiJ9TVjr44Q24',
  },
}

const server = setupServer(
  rest.get('/user/token', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockAuthResponse))
  }),
  rest.get('/info/vehicleNames', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehicleList: React.FC = () => {
  const query = useVehicleNames({
    refresh: 'y',
  })
  return query.isLoading ? null : (
    <div data-testid="result">{query.data?.[0] ?? 'Not logged in'}</div>
  )
}

describe('useVehicleNames', () => {
  it('should render the vehicle names', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehicleList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result[0])
    })

    expect(screen.queryByText(mockResponse.result[0])).toHaveTextContent(
      mockResponse.result[0]
    )
  })
})
