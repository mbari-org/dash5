import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useMissionList } from './useMissionList'

const mockResponse = {
  result: {
    gitRef: 'master',
    list: [
      { path: 'Default.xml' },
      { path: 'Startup.xml' },
      {
        path: 'BehaviorScripts/BoxCarFilter.xml',
        description:
          '\n        Given an input value and an width value, provides a boxcar filter of the\n        input values.\n    ',
      },
    ],
  },
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/git/missionList', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { isLoading, data } = useMissionList()
  return isLoading ? null : (
    <ul>
      {data?.list.map((m) => (
        <li>{m.path}</li>
      ))}
    </ul>
  )
}

describe('useMissionList', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    const firstMissionPath = mockResponse.result.list[0].path
    await waitFor(() => {
      return screen.getByText(firstMissionPath)
    })
    expect(screen.getByText(firstMissionPath)).toHaveTextContent(
      firstMissionPath
    )
  })

  it('keys cache by gitRef only and refetches on mount when reload=y', async () => {
    const reloads: Array<string | null> = []
    server.use(
      rest.get('/git/missionList', (req, res, ctx) => {
        reloads.push(req.url.searchParams.get('reload'))
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const Probe: React.FC<{ reload?: 'y' }> = ({ reload }) => {
      const { data } = useMissionList(reload ? { reload } : {})
      return <div>{data?.list[0]?.path ?? 'loading'}</div>
    }

    const { unmount } = render(
      <MockProviders queryClient={queryClient}>
        <Probe />
      </MockProviders>
    )
    await waitFor(() => {
      expect(screen.getByText('Default.xml')).toBeInTheDocument()
    })
    expect(reloads).toEqual([null])
    expect(
      queryClient.getQueryCache().findAll({ queryKey: ['git', 'missionList'] })
    ).toHaveLength(1)

    unmount()

    render(
      <MockProviders queryClient={queryClient}>
        <Probe reload="y" />
      </MockProviders>
    )
    await waitFor(() => {
      expect(reloads).toEqual([null, 'y'])
    })
    expect(
      queryClient.getQueryCache().findAll({ queryKey: ['git', 'missionList'] })
    ).toHaveLength(1)
  })
})
