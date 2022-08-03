import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getModuleInfo } from './getModuleInfo'

const server = setupServer(
  rest.get('/commands/moduleInfo', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getModuleInfo', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getModuleInfo()
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/command/moduleInfo', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getModuleInfo()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})

export const mockResponse = {
  result: {
    moduleNames: ['BIT', 'Control', 'Derivation'],
    behaviors: {
      Estimation: [
        {
          string: 'TrackAcousticContact',
        },
      ],
      Guidance: [
        {
          string: 'Buoyancy',
        },
        {
          description:
            'Drives the vehicle in a circle at a set radius from a waypoint\n            ',
          string: 'Circle',
        },
      ],
      Navigation: [
        {
          description:
            'Calculates vehicle position using Long BaseLine (LBL) positioning\n            ',
          string: 'LBL',
        },
      ],
    },
    configUris: {
      BIT: {
        SBIT: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
          {
            string: 'kernelVersion',
          },
        ],
        IBIT: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
          {
            string: 'batteryCapacityThreshold',
          },
        ],
      },
      Control: {
        VerticalControl: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
          {
            string: 'buoyancyDefault',
          },
        ],
        HorizontalControl: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
          {
            string: 'kdHeading',
          },
        ],
      },
    },
    outputUris: {
      Simulator: {
        InternalEnvSim: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
        ],
        ExternalSimIgnition: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
        ],
      },
      Trigger: {
        PatchTrack: [
          {
            string: 'detectFrom',
          },
        ],
        PeakDetectVsDepth: [
          {
            description:
              'The variable that is being detected (dependent variable)\n            ',
            string: 'detect',
          },
        ],
      },
    },
    sensors: {
      Navigation: [
        {
          string: 'DeadReckonUsingMultipleVelocitySources',
        },
      ],
      Science: [
        {
          string: 'Aanderaa_O2',
        },
      ],
    },
    settingUris: {
      BIT: {
        CBIT: [
          {
            string: 'platform_fault',
          },
        ],
      },
    },
    uris: {
      Control: {
        VerticalControl: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
        ],
        LoopControl: [
          {
            description:
              'True if component should be loaded at start-up\n            ',
            string: 'loadAtStartup',
          },
          {
            string: 'nominalDt',
          },
          {
            string: 'periodCmd',
          },
        ],
      },
    },
    uriStringSettings: {
      Science: {
        Aanderaa_O2: [
          {
            string: 'mass_concentration_of_oxygen_in_sea_water',
          },
        ],
      },
      CTD_Seabird: [
        {
          description:
            'True if component should be loaded at start-up\n            ',
          string: 'loadAtStartup',
        },
      ],
    },
  },
}
