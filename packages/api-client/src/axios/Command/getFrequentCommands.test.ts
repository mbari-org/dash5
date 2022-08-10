import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getFrequentCommands,
  GetFrequentCommandsParams,
} from './getFrequentCommands'

let params: GetFrequentCommandsParams = {
  vehicleName: 'example',
}

const mockResponse = {
  result: [
    'restart logs',
    'stop',
    'show state',
    'restart app',
    'failc',
    'sdsdsd',
    'get longitude',
    'configSet Express linearApproximation height_above_sea_floor persist',
    'failComponent',
    'quit',
    'report mod sci2.Lat1',
    'dddd',
    "! onESPclient brent - 'slots [24,26,31] => [:dry,:archive_bac]'",
    "!%20onESPclient%20brent%20%E2%80%93%20'slots%20%5B24%2C26%2C31%5D%3D%3E%5B%3Adry%2C%3Aarchive_bac%5D'",
    'get height_above_sea_floor',
    'get ESPComponent.espLogFilterRegex',
    "! onESPclient brent - 'slots %5B24,26,31%5D=>%5B:dry,:archive_bac%5D'",
    'configSet RDI_Pathfinder.loadAtStartup 1 bool persist',
    'ssss',
    '!  echo hello | cat',
    'configSet Express linearApproximation acoustic_receive_time ampere_hour persist',
    '! echo "foo" > /dfev/null',
    'configSet Express linearApproximation VerticalHomogeneityIndexCalculator.vertical_salinity_homogeneity_index 0.001 practical_salinity_unit persist',
    'schedule list',
    "! onESPclient brent - 'slots [24,26,31]=>[:dry,:archive_bac]'",
    'TEST url-encoding in command: []^`{|}',
    "! onESPclient brent ? 'slots [24,26,31]=>[:wet,:archive_bac]'",
    'quick off',
  ],
}

const server = setupServer(
  rest.get('/commands/frequent', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getFrequentCommands', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getFrequentCommands(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/frequent', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getFrequentCommands(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
