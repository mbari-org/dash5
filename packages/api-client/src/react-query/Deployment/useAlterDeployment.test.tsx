import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Deployment/alterDeployment.test'
import { useAlterDeployment } from './useAlterDeployment'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/deployments/launch', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { mutate, isLoading, data } = useAlterDeployment()
  const handleClick = () => {
    mutate({
      deploymentId: 1234,
      deploymentType: 'launch',
      note: 'Vehicle in water.',
      date: '2020-01-01',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Alter Deployment</button>
      {data && <span data-testid="result">{data.vehicle}</span>}
    </div>
  )
}

describe('useAlterDeployment', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Alter Deployment'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.vehicle)
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.vehicle
    )
  })
})
