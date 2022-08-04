import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useCreateDocumentInstance } from './useCreateDocumentInstance'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/documents/instance', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

export const mockResponse = {
  result: {
    docId: 3000788,
    docName: 'Vehicle in water.',
    docInstanceId: 3004095,
    unixTime: 1656376737014,
    email: 'hobson@mbari.org',
    user: 'Brett Hobson',
    text: '<div><h1>launch</h1></div>',
    docInstanceBriefs: [
      {
        docInstanceId: 3004095,
        unixTime: 1656376737014,
        user: 'Brett Hobson',
      },
      {
        docInstanceId: 3004094,
        unixTime: 1656376737014,
        user: 'Brett Hobson',
      },
      {
        docInstanceId: 3004093,
        unixTime: 1656376652459,
        user: 'Brett Hobson',
      },
      {
        docInstanceId: 3004091,
        unixTime: 1656376282467,
        user: 'Brett Hobson',
      },
    ],
  },
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { mutate, isLoading, data } = useCreateDocumentInstance()
  const handleClick = () => {
    mutate({
      docId: 3000788,
      text: '<div><h1>launch</h1></div>',
      newName: 'Vehicle in water.',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Update Document</button>
      {data && <span data-testid="result">{data.docId}</span>}
    </div>
  )
}

describe('useCreateDocumentInstance', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Update Document'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.docId.toString())
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.docId.toString()
    )
  })
})
