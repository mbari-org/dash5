import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useAttachDocumentToDeployment } from './useAttachDocumentToDeployment'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/documents/deployment', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

export const mockResponse = {
  result: {
    docId: 3000788,
    docName: 'New Document.',
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
  const { mutate, isLoading, data } = useAttachDocumentToDeployment()
  const handleClick = () => {
    mutate({
      docId: 3000788,
      deploymentId: 3004095,
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Attach Deployment</button>
      {data && <span data-testid="result">{data?.docId}</span>}
    </div>
  )
}

describe('useAttachDocumentToDeployment', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Attach Deployment'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.docId.toString())
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.docId.toString()
    )
  })
})
