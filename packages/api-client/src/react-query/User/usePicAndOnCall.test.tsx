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

const MockPic: React.FC<{ vehicleName: string | string[] }> = ({
  vehicleName,
}) => {
  const query = usePicAndOnCall(
    {
      vehicleName,
    },
    { enabled: true }
  )
  return query.isLoading ? null : (
    <div>
      {query.data?.map((result, index) => (
        <div data-testid={`user${index}`} key={`${result.pic?.email}-${index}`}>
          {result?.pic?.user}-{index}
        </div>
      ))}
    </div>
  )
}

describe('usePicAndOnCall', () => {
  it('should render the pic users when multiple vehicles are supplied', async () => {
    render(
      <MockProviders queryClient={new QueryClient()} testToken="abcd1234">
        <MockPic vehicleName={['daphne', 'tethys', 'atlas']} />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(`${mockResponse.result.pic.user}-0`)
    })

    expect(screen.getByTestId('user0')).toHaveTextContent(
      `${mockResponse.result.pic.user}-0`
    )
    expect(screen.getByTestId('user1')).toHaveTextContent(
      `${mockResponse.result.pic.user}-1`
    )
    expect(screen.getByTestId('user2')).toHaveTextContent(
      `${mockResponse.result.pic.user}-2`
    )
  })

  it('should render pic user', async () => {
    render(
      <MockProviders queryClient={new QueryClient()} testToken="123456">
        <MockPic vehicleName="daphne" />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(`${mockResponse.result.pic.user}-0`)
    })

    expect(screen.getByTestId('user0')).toHaveTextContent(
      `${mockResponse.result.pic.user}-0`
    )
    expect(screen.queryByTestId('user2')).not.toBeInTheDocument()
  })
})
