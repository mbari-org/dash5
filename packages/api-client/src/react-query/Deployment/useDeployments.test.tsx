import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useDeployments } from './useDeployments'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: ['1', '2', '3'],
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
  rest.get('/deployments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const DeploymentList: React.FC = () => {
  const query = useDeployments({
    vehicleName: 'ahi',
  })
  return query.isLoading ? null : (
    <div data-testid="result">
      {`Found ${query.data?.length} Deployments` ?? 'Not logged in'}
    </div>
  )
}

describe('useDeployments', () => {
  it('should render the vehicle name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()} testToken="this-is-a-test">
        <DeploymentList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(`Found ${mockResponse.result.length} Deployments`)
    })

    expect(
      screen.queryByText(`Found ${mockResponse.result.length} Deployments`)
    ).toHaveTextContent(`Found ${mockResponse.result.length} Deployments`)
  })
})
