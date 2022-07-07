import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Deployment/startDeployment.test'
import { useStartDeployment } from './useStartDeployment'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/deployments/start', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockNoteAction: React.FC = () => {
  const { mutate, isLoading, data } = useStartDeployment()
  const handleClick = () => {
    mutate({
      vehicle: 'sim',
      tag: '1.0.0',
      name: 'test',
      date: '2020-01-01',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Start Deployment</button>
      {data && <span data-testid="result">{data.vehicle}</span>}
    </div>
  )
}

describe('useStartDeployment', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockNoteAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Start Deployment'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.vehicle)
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.vehicle
    )
  })
})
