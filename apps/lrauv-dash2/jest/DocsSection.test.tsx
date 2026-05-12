import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DocsSection from '../components/DocsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../components/testHelpers'

const baseDoc = {
  deploymentBriefs: [{ deploymentId: 3000411, name: 'Pontus 25 MBTS' }],
  vehicleNames: ['pontus'],
}

const mockResponse = {
  result: [
    {
      ...baseDoc,
      docId: 3000798,
      name: 'Pontus 25 Predeployment checklist MBTS',
      docType: 'FILLED',
      latestRevision: { docInstanceId: 3004169, unixTime: 1658248106043 },
    },
    {
      docId: 3000797,
      name: 'Daphne 115 MBTS - Deployment Plan',
      docType: 'NORMAL',
      latestRevision: { docInstanceId: 3004157, unixTime: 1657841758399 },
      deploymentBriefs: [{ deploymentId: 3000412, name: 'Daphne 115 MBTS' }],
      vehicleNames: ['daphne'],
    },
  ],
}

// API returns docs in docId-descending order; the doc with the highest
// unixTime should surface first regardless of its docId.
const mockResponseUnsorted = {
  result: [
    {
      ...baseDoc,
      docId: 3000900,
      name: 'Recent Deployment Plan',
      docType: 'NORMAL',
      latestRevision: { docInstanceId: 3005000, unixTime: 1700000000000 },
    },
    {
      ...baseDoc,
      docId: 3000100,
      name: 'Maintenance Log - Pontus',
      docType: 'NORMAL',
      // old docId but newest unixTime — simulates a doc updated today
      latestRevision: { docInstanceId: 3005001, unixTime: 1800000000000 },
      deploymentBriefs: [],
    },
    {
      ...baseDoc,
      docId: 3000050,
      name: 'Oldest Predeployment Checklist',
      docType: 'FILLED',
      // no latestRevision — should sort last (treated as 0)
      latestRevision: undefined,
      deploymentBriefs: [],
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
          <DocsSection vehicleName="pontus" />
        </MockProviders>
      )
    ).not.toThrow()
  })

  test('should render the name of one of the documents', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection vehicleName="pontus" />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/Pontus 25 Predeployment/i)
    })
    expect(screen.queryByText(/Pontus 25 Predeployment/i)).toBeInTheDocument()
  })

  test('should not render the add document button if not authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection vehicleName="pontus" />
      </MockProviders>
    )
    expect(screen.queryByText(/add document/i)).not.toBeInTheDocument()
  })

  test('should render the add document button if authenticated', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection vehicleName="pontus" authenticated />
      </MockProviders>
    )
    expect(screen.getByText(/add document/i)).toBeInTheDocument()
  })

  test('should sort documents by latestRevision.unixTime descending', async () => {
    server.use(
      rest.get('/documents', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockResponseUnsorted))
      })
    )
    render(
      <MockProviders queryClient={new QueryClient()}>
        <DocsSection vehicleName="pontus" />
      </MockProviders>
    )
    // Wait for all three docs to be rendered
    await waitFor(() => screen.getByText('Maintenance Log - Pontus'))
    await waitFor(() => screen.getByText('Recent Deployment Plan'))
    await waitFor(() => screen.getByText('Oldest Predeployment Checklist'))

    const maintenanceEl = screen.getByText('Maintenance Log - Pontus')
    const recentEl = screen.getByText('Recent Deployment Plan')
    const oldestEl = screen.getByText('Oldest Predeployment Checklist')

    // DOCUMENT_POSITION_FOLLOWING (4) means the argument appears after the
    // reference node in the DOM — i.e. reference renders before argument.
    expect(
      maintenanceEl.compareDocumentPosition(recentEl) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy() // Maintenance Log (1800000000000) before Recent (1700000000000)
    expect(
      recentEl.compareDocumentPosition(oldestEl) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy() // Recent (1700000000000) before Oldest (no unixTime → 0)
  })
})
