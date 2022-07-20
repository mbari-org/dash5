import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useDocuments } from './useDocuments'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Document/getDocuments.test'

const server = setupServer(
  rest.get('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockDoc: React.FC = () => {
  const query = useDocuments({ docId: '3000798', deploymentId: '' })

  return query.isLoading ? null : (
    <div data-testid="docId">{query.data?.[0].docId ?? 'Loading'}</div>
  )
}

it('should render the document id', async () => {
  render(
    <MockProviders queryClient={new QueryClient()}>
      <MockDoc />
    </MockProviders>
  )

  const docIdAsString = mockResponse.result[0].docId.toString()
  await waitFor(() => {
    return screen.queryByText(docIdAsString)
  })

  expect(screen.queryByTestId('docId')).toHaveTextContent(docIdAsString)
})
