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
  rest.delete('/commands/queue', (req, res, ctx) => {
    const vehicle = req.url.searchParams.get('vehicle')
    const refEventId = req.url.searchParams.get('refEventId')
    if (vehicle !== 'sim' || refEventId !== '12345') {
      return res(ctx.status(400), ctx.json({ error: 'unexpected params' }))
    }
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockDeleteAction: React.FC = () => {
  const { mutate, isLoading, isSuccess, isError } = useDeleteCommandQueue()
  const handleClick = () => {
    mutate({ vehicle: 'sim', refEventId: 12345 })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Cancel Directive</button>
      {isSuccess && <span data-testid="result">cancelled</span>}
      {isError && <span data-testid="error">error</span>}
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

  it('should skip cache invalidation when TethysDash returns HTTP 200 with an error body', async () => {
    server.use(
      rest.delete('/commands/queue', (_req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.json({ error: 'Command already dispatched to vehicle' })
        )
      )
    )
    const queryClient = new QueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    render(
      <MockProviders queryClient={queryClient}>
        <MockDeleteAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Cancel Directive'))
    // Mutation still resolves (HTTP 200) so isSuccess becomes true
    await waitFor(() => screen.getByTestId('result'))
    expect(invalidateSpy).not.toHaveBeenCalled()
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
    await waitFor(() => screen.getByTestId('error'))
    expect(screen.queryByTestId('result')).not.toBeInTheDocument()
  })
})
