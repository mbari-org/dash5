import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getInfo, GetInfoParams } from './getInfo'

let params: GetInfoParams = {}

const mockResponse = {
  result: {
    vehicleNames: [
      'ahi',
      'aku',
      'brizo',
      'daphne',
      'galene',
      'makai',
      'melia',
      'mesobot',
      'opah',
      'pallas',
      'polaris',
      'pontus',
      'proxima',
      'pyxis',
      'sim',
      'stella',
      'tethys',
      'triton',
    ],
    defaultVehicle: 'tethys',
    eventTypes: [
      'argoReceive',
      'command',
      'dataProcessed',
      'deploy',
      'emergency',
      'gpsFix',
      'launch',
      'logCritical',
      'logFault',
      'logImportant',
      'logPath',
      'note',
      'patch',
      'recover',
      'run',
      'sbdReceipt',
      'sbdReceive',
      'sbdSend',
      'tracking',
    ],
    appConfig: {
      version: '4.8.7',
      external: {
        base: 'https://okeanids.mbari.org',
        dashui: 'https://okeanids.mbari.org/dash4/',
        eventTypeDoc: 'https://docs.mbari.org/tethysdash/td/eventtypes/',
        miscLinksFile: '/opt/tethysdash/conf/miscLinks.json',
        schemaBase: 'http://okeanids.mbari.org/tethys/Xml',
        tethysdash: 'https://okeanids.mbari.org/TethysDash',
        useradmin: 'https://okeanids.mbari.org/',
      },
      googleApiKey: 'AIza55555v055555xu555555Al6L55555HJ5555',
      odss2dashApi: 'https://okeanids.mbari.org/odss2dash/api',
      recaptcha: {
        siteKey: '5555555555555555wjXAb97__99Abc8888fP',
      },
      slack: {
        primaryChannel: '#lrauvs',
      },
      websockets: {
        useWebsocket: true,
        maxIdleTimeout: 60000,
      },
      pusher: {
        appKey: 'c0555553555554555556',
        eventChannel: 'td-events',
        cluster: 'mt1',
      },
    },
    eventKinds: [
      {
        name: 'AcComms',
        base: 'Ac Comms',
      },
      {
        name: 'ArgoReceive',
        base: 'ArgoReceive',
      },
      {
        name: 'CommandRequest',
        base: 'Command Request',
      },
      {
        name: 'Critical',
        base: 'Critical',
      },
      {
        name: 'Data',
        base: 'Data',
      },
      {
        name: 'Deployment',
        base: 'Deployment',
      },
      {
        name: 'DirectCommsAck',
        base: 'Direct Comms',
        subKind: 'ACK',
      },
      {
        name: 'DirectCommsReceived',
        base: 'Direct Comms',
        subKind: 'Received',
      },
      {
        name: 'Emergency',
        base: 'Emergency',
      },
      {
        name: 'Fault',
        base: 'Fault',
      },
      {
        name: 'GPSFix',
        base: 'GPS Fix',
      },
      {
        name: 'Important',
        base: 'Important',
      },
      {
        name: 'Launch',
        base: 'Launch',
      },
      {
        name: 'Log',
        base: 'Log',
      },
      {
        name: 'MissionRequest',
        base: 'Mission Request',
      },
      {
        name: 'Note',
        base: 'Note',
      },
      {
        name: 'Patch',
        base: 'Patch',
      },
      {
        name: 'Recover',
        base: 'Recover',
      },
      {
        name: 'SatCommsRequest',
        base: 'Sat Comms',
        subKind: 'Request',
      },
      {
        name: 'SatCommsQueued',
        base: 'Sat Comms',
        subKind: 'Queued',
      },
      {
        name: 'SatCommsReceived',
        base: 'Sat Comms',
        subKind: 'Received',
      },
      {
        name: 'SatCommsReceivedVehicleAck',
        base: 'Sat Comms',
        subKind: 'Received (Vehicle ACK)',
      },
      {
        name: 'Tracking',
        base: 'Tracking',
      },
    ],
  },
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getInfo', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getInfo(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getInfo(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
