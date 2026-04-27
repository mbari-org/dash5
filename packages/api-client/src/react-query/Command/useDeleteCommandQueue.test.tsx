import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useDeleteCommandQueue } from './useDeleteCommandQueue'

const mockResponse = {
  result: 'ok',
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.delete('/commands/queue', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockDeleteAction: React.FC = () => {
  const { mutate, isLoading, isSuccess } = useDeleteCommandQueue()
  const handleClick = () => {
    mutate({ vehicle: 'sim', refEventId: 12345 })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Cancel Directive</button>
      {isSuccess && <span data-testid="result">cancelled</span>}
    </div>
  )
}

describe('useDeleteCommandQueue', () => {
  it('should fire DELETE with provided params and report success', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockDeleteAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Cancel Directive'))
    await waitFor(() => screen.getByTestId('result'))
    expect(screen.getByTestId('result')).toHaveTextContent('cancelled')
  })

  it('should not show success result on server error', async () => {
    server.use(
      rest.delete('/commands/queue', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockDeleteAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Cancel Directive'))
    await waitFor(() =>
      expect(screen.queryByTestId('result')).not.toBeInTheDocument()
    )
  })
})
