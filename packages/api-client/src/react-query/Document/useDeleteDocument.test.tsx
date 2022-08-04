import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useDeleteDocument } from './useDeleteDocument'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.delete('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

export const mockResponse = undefined

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { mutate, isLoading, isSuccess } = useDeleteDocument()
  const handleClick = () => {
    mutate({
      docId: 3000788,
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Delete Document</button>
      {isSuccess && <span data-testid="result">DELETED!</span>}
    </div>
  )
}

describe('useDeleteDocument', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Delete Document'))
    await waitFor(() => {
      return screen.getByText('DELETED!')
    })
    expect(screen.getByTestId('result')).toHaveTextContent('DELETED!')
  })
})
