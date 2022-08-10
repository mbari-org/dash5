import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getScript, GetScriptParams } from './getScript'

let params: GetScriptParams = {
  deploymentPath: '/opt/example',
  path: 'Missions/Science/sci2.xml',
  deploymentId: 'exampleID',
}

const mockResponse = {
  result: {
    id: 'sampling_vehicle',
    scriptArgs: [
      {
        description: '\n        Maximum duration of mission\n    ',
        name: 'MissionTimeout',
        unit: 'hour',
        value: '2',
      },
      {
        description:
          '\n        Elapsed time after previous surface communications when vehicle will\n        begin to ascend for additional surface communications\n    ',
        name: 'NeedCommsTime',
        unit: 'minute',
        value: '60',
      },
      {
        description:
          '\n        Latitude of waypoint to start drifting. If NaN, start drifting at the current position.\n    ',
        name: 'Lat',
        unit: 'degree',
        value: 'NaN',
      },
      {
        description:
          '\n        Longitude of waypoint to start drifting. If NaN, start drifting at the current position.\n    ',
        name: 'Lon',
        unit: 'degree',
        value: 'NaN',
      },
      {
        description: '\n        Depth held during drift mode\n    ',
        name: 'Depth',
        unit: 'meter',
        value: '30',
      },
      {
        description: '\n        Depth for initial approach to station.\n    ',
        name: 'ApproachDepth',
        unit: 'meter',
        value: '15',
      },
      {
        description: '\n        Vehicle transit speed.\n    ',
        name: 'ApproachSpeed',
        unit: 'meter_per_second',
        value: '1.0',
      },
      {
        description:
          '\n        How much vertical drift from the specified depth is allowed in drift\n        mode\n    ',
        name: 'DepthDeadband',
        unit: 'meter',
        value: '2',
      },
      {
        description:
          '\n        Minimum height above the sea floor for the entire mission.\n    ',
        name: 'MinAltitude',
        unit: 'meter',
        value: '5',
      },
      {
        description: '\n        Maximum depth for the entire mission.\n    ',
        name: 'MaxDepth',
        unit: 'meter',
        value: '45',
      },
      {
        description:
          '\n        Minimum offshore distance for the entire mission.\n    ',
        name: 'MinOffshore',
        unit: 'kilometer',
        value: '2',
      },
    ],
    latLonNamePairs: [{ latName: 'Lat', lonName: 'Lon' }],
    inserts: [
      {
        id: 'Science',
        scriptArgs: [
          {
            description:
              '\n        Turns on peak detection of Cholorphyll.\n    ',
            name: 'PeakDetectChlActive',
            value: 'False',
          },
          {
            description:
              '\n        If greater than zero, report a peak every window. If NaN or zero, this\n        variable is ignored.\n    ',
            name: 'TimeWindowPeakReport',
            unit: 'minute',
            value: 'NaN',
          },
          {
            description:
              '\n        Turns on reporting of the highest peak value of chlorophyll on yo-yo\n        profiles in a horizontal sliding window (of length\n        numProfilesSlidingwindow)\n    ',
            name: 'HighestChlPeakReportActive',
            value: 'False',
          },
          {
            description:
              '\n        Turns on reporting of the highest peak value of salinity on yo-yo\n        profiles in a horizontal sliding window (of length\n        numProfilesSlidingwindow)\n    ',
            name: 'HighestSaltPeakReportActive',
            value: 'False',
          },
          {
            description:
              '\n        Turns on reporting of the highest peak value of oil on yo-yo profiles in\n        a horizontal sliding window (of length numProfilesSlidingwindow)\n    ',
            name: 'HighestOilPeakReportActive',
            value: 'False',
          },
          {
            description: '\n        If tracking a patch\n    ',
            name: 'PatchTracking',
            value: 'False',
          },
          {
            description:
              '\n        Whether to track a trough. If false, track peak; if true, track trough.\n        Default is false.\n    ',
            name: 'DetectTrough',
            value: 'False',
          },
          {
            description:
              '\n        Width of boxcar filter applied to yoyo-wise chl peaks to pick out the\n        highest peak.\n    ',
            name: 'FilterWidthHorizontal',
            unit: 'count',
            value: '3',
          },
          {
            description:
              '\n        Length of horizontal sliding window. The highest yoyo-wise chl peak\n        (after low-pass filtering by a filter of length FilterWidthHorizontal)\n        within this window.\n    ',
            name: 'NumProfilesSlidingwindow',
            unit: 'count',
            value: '100',
          },
          {
            description:
              '\n        When filtered horizontal value is this fraction of the peak, consider it\n        outside the patch.\n    ',
            name: 'OffPeakFractionHorizontal',
            unit: 'percent',
            value: '80',
          },
          {
            description:
              '\n        Turns on peak detection of Nitrate (and turns on ISUS).\n    ',
            name: 'PeakDetectNO3Active',
            value: 'False',
          },
          {
            description:
              '\n        Turns on peak detection of Dissolved Oil.\n    ',
            name: 'PeakDetectOilActive',
            value: 'False',
          },
          {
            description:
              '\n        Turns on peak detection of\n        concentration_of_colored_dissolved_organic_matter_in_sea_water from FDOM\n        sensor.\n    ',
            name: 'PeakDetectFDOMActive',
            value: 'False',
          },
          {
            description: '\n        Turns on peak detection of salinity.\n    ',
            name: 'PeakDetectSalinityActive',
            value: 'False',
          },
          {
            description:
              '\n        Turns on seawater temperature derivative.\n    ',
            name: 'UpwardDerivativeOfTemperatureActive',
            value: 'False',
          },
          {
            description:
              '\n        Automatically set to True if the Aanderaa O2 sensor is installed. Set to\n        false to disable reading Aandera O2.\n    ',
            name: 'EnabledAanderaaO2',
            value: 'Science:Aanderaa_O2.loadAtStartup',
          },
          {
            description:
              '\n        Automatically set to true if the Neil Brown CTD is enabled. Set to false\n        to disable reading from the Neil Brown.\n    ',
            name: 'EnabledNeilBrown',
            value: 'Science:CTD_NeilBrown.loadAtStartup',
          },
          {
            description:
              '\n        Automatically set to true if the CTD is enabled. Set to false to disable\n        reading from the CTD.\n    ',
            name: 'EnabledSeabird',
            value: 'Science:CTD_Seabird.loadAtStartup',
          },
          {
            description:
              '\n        Automatically set to true if the the WetLabs BB2FL is enabled. Set to\n        false to disable the WetLabs BB2FL.\n    ',
            name: 'EnabledWetLabsBB2FL',
            value: 'Science:WetLabsBB2FL.loadAtStartup',
          },
          {
            description:
              '\n        Automatically set to true if the the WetLabs SeaOWL UV-A is enabled. Set\n        to false to disable the WetLabs SeaOWL UV-A.\n    ',
            name: 'EnabledWetLabsSeaOWL_UV_A',
            value: 'Science:WetLabsSeaOWL_UV_A.loadAtStartup',
          },
          {
            description:
              '\n        Automatically set to true if the the WetLabs UBAT is enabled. Set to\n        false to disable the WetLabs UBAT.\n    ',
            name: 'EnabledWetLabsUBAT',
            value: 'Science:WetLabsUBAT.loadAtStartup',
          },
          {
            description:
              '\n        Low-pass window length (based on depth sensor sampling interval 0.4\n        second) for low-pass filtering.\n    ',
            name: 'LowPassWindowLength',
            unit: 'count',
            value: '20',
          },
          {
            description:
              '\n        Median filter length (only for chlorophyll fluorescence which tends to\n        have spikes)\n    ',
            name: 'MedianFilterLen',
            unit: 'count',
            value: '5',
          },
          {
            description:
              '\n        Shallow depth bound for detecting any peak on each descent or ascent\n        profile.\n    ',
            name: 'PeakShallowBound',
            unit: 'meter',
            value: 'NaN',
          },
          {
            description:
              '\n        Deep depth bound for detecting any peak on each descent or ascent\n        profile.\n    ',
            name: 'PeakDeepBound',
            unit: 'meter',
            value: 'NaN',
          },
          {
            description:
              '\n        Depth change threshold for determining vehicle attitude flip.\n    ',
            name: 'DepChangeThreshForAttitudeFlip',
            unit: 'meter',
            value: '2.0',
          },
        ],
      },
      {
        id: 'NeedComms',
        scriptArgs: [
          {
            description:
              '\n        Elapsed time after most recent surfacing when vehicle will begin to\n        ascend to the surface again. The timing is actually based on the\n        variable Universal:time_fix instead of the variable\n        Universal:platform_communications because the latter is not toggled\n        until the message queue is clear. As a result, there are situations\n        where the vehicle might dive for the first half of a yo, then return to\n        the surface to continue communications, rendering the communications\n        timeout useless. When adjusting this parameter, do not use "set", use\n        Assign in a mission, or set NeedComms:DiveInterval from the command\n        line.\n    ',
            name: 'DiveInterval',
            unit: 'hour',
            value: '3',
          },
          {
            description:
              '\n        Extra time to wait for the vehicle to pitch up (avoid truncating a yo).\n    ',
            name: 'WaitForPitchUp',
            unit: 'minute',
            value: '10',
          },
          {
            description: '\n        Pitch to maintain while ascending\n    ',
            name: 'SurfacePitch',
            unit: 'degree',
            value: '20',
          },
          {
            description:
              '\n        Depth rate to maintain while ascending. Set to NaN if using pitch\n    ',
            name: 'SurfaceDepthRate',
            unit: 'meter_per_second',
            value: 'NaN',
          },
          {
            description:
              '\n        Standard speed during surfacing. Don\u0027t reduce this too much below 1 m/s\n        -- the elevators can stall. (At 0.5 m/s, we have observed evidence of\n        stall in the past.)\n    ',
            name: 'SurfaceSpeed',
            unit: 'meter_per_second',
            value: '1',
          },
          {
            description:
              '\n        Maximum amount of time to spend trying to get each GPS fix.\n    ',
            name: 'GPSTimeout',
            unit: 'minute',
            value: '7',
          },
          {
            description:
              '\n        Maximum amount of time to spend on the surface trying to communicate\n        before giving up, getting another GPS fix, and diving again.\n    ',
            name: 'CommsTimeout',
            unit: 'minute',
            value: '30',
          },
        ],
      },
      {
        id: 'StandardEnvelopes',
        scriptArgs: [
          {
            description: '\n        Minimum height above the sea floor.\n    ',
            name: 'MinAltitude',
            unit: 'meter',
            value: '5',
          },
          {
            description:
              '\n        Maximum allowable depth during the mission.\n    ',
            name: 'MaxDepth',
            unit: 'meter',
            value: '200',
          },
          {
            description:
              '\n        Minimum distance from the shoreline to maintain\n    ',
            name: 'MinOffshore',
            unit: 'meter',
            value: '2000',
          },
        ],
      },
    ],
  },
}

const server = setupServer(
  rest.get('/commands/script', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockResponse,
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getScript', () => {
  it('should return the mocked result/params when successful', async () => {
    const result = await getScript(params)
    expect(result).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/script', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getScript(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
