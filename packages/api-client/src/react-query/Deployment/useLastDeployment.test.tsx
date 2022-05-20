import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useLastDeployment } from './useLastDeployment'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: {
    deploymentId: 3000135,
    vehicleName: 'ahi',
    name: 'Ahi 5 Falkor Leg 1',
    path: '2018-03-10',
    startEvent: { unixTime: 1520704200000, state: 1, eventId: 8006772 },
    endEvent: { unixTime: 1520749620000, state: 0, eventId: 8013481 },
  },
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
  rest.get('/deployments/last', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehicleList: React.FC = () => {
  const query = useLastDeployment({
    vehicle: 'ahi',
    to: '2022-05-20T01:14:10.290Z',
  })
  return query.isLoading ? null : (
    <div data-testid="result">{query.data?.name ?? 'Not logged in'}</div>
  )
}

describe('useLastDeployment', () => {
  it('should render the vehicle name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()} testToken="this-is-a-test">
        <MockVehicleList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.name)
    })

    expect(screen.queryByText(mockResponse.result.name)).toHaveTextContent(
      mockResponse.result.name
    )
  })
})
