import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useDocumentInstance } from './useDocumentInstance'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Document/getDocumentInstance.test'

const server = setupServer(
  rest.get('/documents/instance', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockDoc: React.FC = () => {
  const query = useDocumentInstance({ docInstanceId: '3000798' })

  return query.isLoading ? null : (
    <div data-testid="docId">{query.data?.docName ?? 'Loading'}</div>
  )
}

it('should render the document id', async () => {
  render(
    <MockProviders queryClient={new QueryClient()}>
      <MockDoc />
    </MockProviders>
  )

  const docName = mockResponse.result.docName
  await waitFor(() => screen.findByTestId('docId'))

  expect(screen.queryByTestId('docId')).toHaveTextContent(docName)
})
