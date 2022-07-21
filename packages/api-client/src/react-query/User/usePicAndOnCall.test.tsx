import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { usePicAndOnCall } from './usePicAndOnCall'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/User/getPicAndOnCall.test'

const server = setupServer(
  rest.get('/user/picoc', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockUser: React.FC = () => {
  const query = usePicAndOnCall({
    vehicleName: 'daphne',
  })
  return query.isLoading ? null : (
    <div>
      <span data-testid="user">{query.data?.pic?.user ?? 'Loading'}</span>
    </div>
  )
}

describe('usePicAndOnCall', () => {
  it('should render the user name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockUser />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.pic.user)
    })

    expect(screen.getByTestId('user')).toHaveTextContent(
      mockResponse.result.pic.user
    )
  })
})
