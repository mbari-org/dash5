import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAssignPicAndOnCall } from './useAssignPicAndOnCall'
import { mockResponse, params } from '../../axios/User/assignPicAndOnCall.test'
import { QueryClientProvider, QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import axios from 'axios'

const server = setupServer(
  rest.post('/user/picoc', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient()

const MockAssignment: React.FC = () => {
  const assignPic = useAssignPicAndOnCall({
    instance: axios.create(),
  })
  return (
    <button
      data-testid="button"
      onClick={() => {
        assignPic.mutate({ ...params })
      }}
    >
      {assignPic.data?.eventId ?? 'Not Assigned'}
    </button>
  )
}

const MockComponent: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <MockAssignment />
  </QueryClientProvider>
)

describe('useAssignPicAndOnCall', () => {
  it('should render the eventId upon completion', async () => {
    render(<MockComponent />)
    fireEvent.click(screen.getByTestId('button'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.eventId)
    })

    expect(screen.queryByText(mockResponse.result.eventId)).toHaveTextContent(
      `${mockResponse.result.eventId}`
    )
  })
})
