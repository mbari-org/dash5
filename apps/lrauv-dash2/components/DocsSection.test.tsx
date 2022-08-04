import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DocsSection from './DocsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

const mockResponse = {
  result: [
    {
      docId: 3000798,
      name: 'Pontus 25 Predeployment checklist MBTS',
      docType: 'FILLED',
      latestRevision: {
        docInstanceId: 3004169,
        unixTime: 1658248106043,
      },
      deploymentBriefs: [
        {
          deploymentId: 3000411,
          name: 'Pontus 25 MBTS',
        },
      ],
      vehicleNames: ['pontus'],
    },
    {
      docId: 3000797,
      name: 'Daphne 115 MBTS - Deployment Plan',
      docType: 'NORMAL',
      latestRevision: {
        docInstanceId: 3004157,
        unixTime: 1657841758399,
      },
      deploymentBriefs: [
        {
          deploymentId: 3000412,
          name: 'Daphne 115 MBTS',
        },
      ],
      vehicleNames: ['daphne'],
    },
  ],
}
const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('DocsSection', () => {
  test('should render the component', async () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <DocsSection />
        </MockProviders>
      )
    ).not.toThrow()
  })

  test('should render the name of one of the documents', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/Pontus 25 Predeployment/i)
    })
    expect(screen.queryByText(/Pontus 25 Predeployment/i)).toBeInTheDocument()
  })

  test('should not render the add note button if not authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection />
      </MockProviders>
    )
    expect(screen.queryByText(/add document/i)).not.toBeInTheDocument()
  })

  test('should render the add document button if authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection authenticated />
      </MockProviders>
    )
    expect(screen.getByText(/add document/i)).toBeInTheDocument()
  })
})
