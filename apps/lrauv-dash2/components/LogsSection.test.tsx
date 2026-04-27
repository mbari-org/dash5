import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LogsSection from './LogsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

export const mockResponse = {
  result: [
    {
      eventId: 16982316,
      vehicleName: 'triton',
      unixTime: 1657733864275,
      isoTime: '2022-07-13T17:37:44.275Z',
      component: 'Triton 18 BioAc',
      eventType: 'deploy',
      user: 'Brent Jones',
      state: 0,
      name: 'Triton 18 BioAc',
    },
    {
      eventId: 16982312,
      vehicleName: 'triton',
      unixTime: 1657733853379,
      isoTime: '2022-07-13T17:37:33.379Z',
      eventType: 'dataProcessed',
      path: '2022/202207/20220712T221014',
    },
    {
      eventId: 16982309,
      vehicleName: 'triton',
      unixTime: 1657733848418,
      isoTime: '2022-07-13T17:37:28.418Z',
      component: 'Express0196.lzma',
      eventType: 'sbdReceive',
      state: 2,
      momsn: '16982309',
      dataLen: 840,
      path: '2022/202207/20220712T221014/Express0196.lzma',
    },
  ],
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('LogsSection', () => {
  test('should render the component', async () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <LogsSection
            vehicleName="triton"
            from={1657733848418}
            deploymentLogsOnly={false}
            setDeploymentLogsOnly={() => {}}
          />
        </MockProviders>
      )
    ).not.toThrow()
  })

  test('should render end of the deployment', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="triton"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/Triton 18 BioAc/i)
    })
    expect(screen.getByText(/Triton 18 BioAc/i)).toBeInTheDocument()
    expect(screen.getByText(/ENDED/i)).toBeInTheDocument()
    expect(screen.getByText(/by Brent Jones/i)).toBeInTheDocument()
  })

  test('should render bytes received', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="makai"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/Received 840 bytes/i)
    })
    expect(screen.getByText(/Received 840 bytes/i)).toBeInTheDocument()
  })

  test('should hide data events by default', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="triton"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/Deployment/i)).toBeInTheDocument()
    })

    // The mock includes one `dataProcessed` event which maps to the "Data" label.
    expect(screen.queryByText(/^Data$/)).not.toBeInTheDocument()
  })

  test('should include data events when checkbox is checked', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="triton"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /filter/i })
      ).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /filter/i }))

    const checkbox = await waitFor(() =>
      screen.getByRole('checkbox', {
        name: /include data events/i,
      })
    )

    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(screen.getByText(/^Data$/)).toBeInTheDocument()
    })
  })

  test('shows help when no event types are selected', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="triton"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /filter/i })
      ).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /filter/i }))
    fireEvent.click(screen.getByLabelText('select-all'))

    const banner = await waitFor(() => screen.getByRole('status'))
    expect(banner).toHaveTextContent(
      /Open Filter and choose at least one type to see logs/i
    )
  })

  test('shows no matching events banner when log search matches nothing', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <LogsSection
          vehicleName="triton"
          from={1657733848418}
          deploymentLogsOnly={false}
          setDeploymentLogsOnly={() => {}}
        />
      </MockProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/Deployment/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /filter/i }))
    fireEvent.change(screen.getByLabelText('search'), {
      target: { value: '__no_log_match_xyz__' },
    })

    const noMatchBanner = await waitFor(() => screen.getByRole('status'), {
      timeout: 3000,
    })
    expect(noMatchBanner).toHaveTextContent(/No matching events/i)
    expect(noMatchBanner).toHaveTextContent(/Try adjusting Filter or search/i)
  })
})
