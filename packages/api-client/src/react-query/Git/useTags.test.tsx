import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useTags } from './useTags'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Git/tags.test'

const server = setupServer(
  rest.get('/git/tags', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockTagList: React.FC = () => {
  const query = useTags({
    limit: 30,
  })
  return query.isLoading ? null : (
    <div data-testid="result">{query.data?.[0].tag ?? 'Not logged in'}</div>
  )
}

describe('useTags', () => {
  it('should render the first tag name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockTagList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result[0].tag)
    })

    expect(screen.queryByText(mockResponse.result[0].tag)).toHaveTextContent(
      mockResponse.result[0].tag
    )
  })
})
