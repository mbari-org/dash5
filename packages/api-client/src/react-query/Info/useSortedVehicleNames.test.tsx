import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSortedVehicleNames } from './useSortedVehicleNames'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockVehicleResponse = {
  result: ['ahi', 'brizo', 'daphne'],
}

const mockDeploymentResponse = {
  brizo: {
    result: {
      deploymentId: 3000388,
      vehicleName: 'brizo',
      name: 'Brizo 10 EcoHAB',
      path: '2022-05-16',
      startEvent: { unixTime: 1652734481691, state: 1, eventId: 16791084 },
      launchEvent: {
        unixTime: 1652734494872,
        eventId: 16794560,
        note: 'Vehicle in water',
      },
    },
  },
  daphne: {
    result: {
      deploymentId: 3000387,
      vehicleName: 'daphne',
      name: 'Daphne 113 MBTS',
      path: '2022-04-11',
      startEvent: { unixTime: 1652734292758, state: 1, eventId: 16791081 },
      launchEvent: {
        unixTime: 1652807507838,
        eventId: 16797918,
        note: 'Vehicle in water',
      },
      recoverEvent: {
        unixTime: 1652971736577,
        eventId: 16808573,
        note: 'Vehicle recovered',
      },
      dlistResult: {
        contents:
          '# Deployment name: Daphne 113 MBTS\n#         Git tag: 2022-04-11\n#    Vehicle name: daphne\n#\n# Start:   2022-05-16T13:51:32.758-07:00\n# Launch:  2022-05-17T10:11:47.838-07:00\n# Recover: 2022-05-19T07:48:56.577-07:00\n# End:     2022-05-19T08:49:41.457-07:00\n#\n# Directories listed below comprise full set of logs for this deployment:\n#20220516T205811\n20220517T171229\n20220518T235803\n20220519T084911\n#20220519T144934\n',
        path: '/opt/tethysdash/data/daphne/missionlogs/2022/20220516_20220519.dlist',
      },
      endEvent: { unixTime: 1652975381457, state: 0, eventId: 16808931 },
    },
  },
  ahi: {
    result: {
      deploymentId: 3000135,
      vehicleName: 'ahi',
      name: 'Ahi 5 Falkor Leg 1',
      path: '2018-03-10',
      startEvent: { unixTime: 1520704200000, state: 1, eventId: 8006772 },
      endEvent: { unixTime: 1520749620000, state: 0, eventId: 8013481 },
    },
  },
}

const server = setupServer(
  rest.get('/info/vehicleNames', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockVehicleResponse))
  }),
  rest.get('/deployments/last', (req, res, ctx) => {
    const vehicle = req.url.searchParams.get('vehicle') as
      | 'ahi'
      | 'brizo'
      | 'daphne'
    return res(
      ctx.status(200),
      ctx.json(vehicle ? mockDeploymentResponse[vehicle] : {})
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehicleList: React.FC = () => {
  const query = useSortedVehicleNames({
    refresh: 'y',
  })
  return query.isLoading ? null : (
    <>
      <div data-testid="result0">{query.data?.[0]}</div>
      <div data-testid="result1">{query.data?.[1]}</div>
      <div data-testid="result2">{query.data?.[2]}</div>
    </>
  )
}

describe('useVehicleNames', () => {
  it('should render the vehicle names', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehicleList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByTestId('result0')
    })

    expect(screen.getByTestId('result0')).toHaveTextContent(
      mockDeploymentResponse.brizo.result.vehicleName
    )
    expect(screen.getByTestId('result1')).toHaveTextContent(
      mockDeploymentResponse.daphne.result.vehicleName
    )
    expect(screen.getByTestId('result2')).toHaveTextContent(
      mockDeploymentResponse.ahi.result.vehicleName
    )
  })
})
