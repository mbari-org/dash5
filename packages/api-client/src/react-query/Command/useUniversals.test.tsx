import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useUniversals } from './useUniversals'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = { result: ['some-value', 'some-other-value'] }

const server = setupServer(
  rest.get('/commands/universals', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockUniversal: React.FC = () => {
  const query = useUniversals({})

  return query.isLoading ? null : (
    <div>
      <span data-testid="universal">{query.data?.[0] ?? 'Loading'}</span>
    </div>
  )
}

describe('useUniversals', () => {
  it('should display the universal name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockUniversal />
      </MockProviders>
    )
    const universal = mockResponse.result[0]
    await waitFor(() => {
      return screen.getByText(universal)
    })

    expect(screen.getByTestId('universal')).toHaveTextContent(universal)
  })
})
