import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useUsersByRole } from './useUsersByRole'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/User/usersByRole.test'

const server = setupServer(
  rest.get('/user/byrole', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockUser: React.FC = () => {
  const query = useUsersByRole({
    role: 'none',
  })
  return query.isLoading ? null : (
    <div>
      <span data-testid="fullName">
        {query.data?.[0].fullName ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useUsersByRole', () => {
  it("should render the user's full name", async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockUser />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result[0].fullName)
    })

    expect(screen.getByTestId('fullName')).toHaveTextContent(
      mockResponse.result[0].fullName
    )
  })
})
