import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useCommands } from './useCommands'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Command/getCommands.test'

const server = setupServer(
  rest.get('/commands', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockBurn: React.FC = () => {
  const query = useCommands()

  return query.isLoading ? null : (
    <div>
      <span data-testid="keyword">
        {query.data?.commands?.[2].keyword ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useCommands', () => {
  it('should display the command keyword', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockBurn />
      </MockProviders>
    )
    const keyword = mockResponse.result.commands[2].keyword
    await waitFor(() => {
      return screen.getByText(keyword)
    })

    expect(screen.getByTestId('keyword')).toHaveTextContent(keyword)
  })
})
