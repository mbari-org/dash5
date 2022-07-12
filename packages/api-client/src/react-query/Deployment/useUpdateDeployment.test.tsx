import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Deployment/updateDeployment.test'
import { useUpdateDeployment } from './useUpdateDeployment'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.put('/deployments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockUpdateAction: React.FC = () => {
  const { mutate, isLoading, data } = useUpdateDeployment()
  const handleClick = () => {
    mutate({
      deploymentId: mockResponse.result.deploymentId,
      tag: '1.0.0',
      name: 'test',
      startDate: '2020-01-01',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Update Deployment</button>
      {data && <span data-testid="result">{data.deploymentId}</span>}
    </div>
  )
}

describe('useUpdateDeployment', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockUpdateAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Update Deployment'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.deploymentId.toString())
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.deploymentId.toString()
    )
  })
})
