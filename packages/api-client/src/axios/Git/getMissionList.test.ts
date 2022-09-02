import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getMissionList, MissionListParams } from './getMissionList'

let params: MissionListParams = {
  reload: 'y',
}

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
      {
        path: 'BehaviorScripts/DepthEnvelopeReplacement.xml',
        description:
          '\n        Overly simple example replacement for DepthEnvelope behavior. Only takes\n        three settings: maxDepth, minDepth, and pitch\n    ',
      },
      {
        path: 'BehaviorScripts/FiniteDifference.xml',
        description:
          '\n        Given an input value and an order, calculate the backwards-looking\n        finite difference.\n    ',
      },
      {
        path: 'BehaviorScripts/LawnMower.xml',
        description:
          '\n        Drives the vehicle in a pattern like a lawnmower search pattern.\n        Settings allow forward progression along a bearing, to extend to the\n        left and/or right of the start point, and to start to the left of right\n        of the start point.\n    ',
      },
      {
        path: 'BehaviorScripts/WaypointReplacement.xml',
        description:
          '\n        Simple example replacement for Waypoint behavior. Only takes two\n        settings: latitude and longitude\n    ',
      },
      { path: 'Demo/BoxCarFilterDemo.xml' },
      { path: 'Demo/CallTest.xml' },
      { path: 'Demo/CallTestScience.xml' },
      { path: 'Demo/Circle.xml' },
      {
        path: 'Demo/CurrentEstimator.xml',
        description: '\n        Just a demo to test current estimation.\n    ',
      },
      { path: 'Demo/DVL_modetest.xml' },
      { path: 'Demo/DepthEnvelopeReplacementDemo.xml' },
      {
        path: 'Demo/DiveFast.xml',
        description:
          '\n        Go for a run on a heading without waiting for surface comms or GPS. The\n        mission timeout is hard coded to 30 minutes. Use dive timeout to stop\n        sooner.\n    ',
      },
      { path: 'Demo/DiveTestElevator.xml' },
      { path: 'Demo/DiveTestElevatorTank.xml' },
      { path: 'Demo/DiveTestMass.xml' },
      { path: 'Demo/DiveTestMassTank.xml' },
      { path: 'Demo/DockingModeTest.xml' },
      {
        path: 'Demo/DockingTankLineCaptureTest.xml',
        description:
          '\n   \t    First make the following adjustment to Insert/LineCapture\n   \t    -    \n        +    \n        Add the specific configs to dock.cfg and then the mission will:\n        1.) Wait timeout for loading in launcher.\n        2.) Turn on prop and arm for docking if the range is low enough.\n        4.) Cable present \u003d\u003d latch for timeout then release, float up, and end mission.\n    ',
      },
      { path: 'RegressionTests/InsertSurfaceOps.tl' },
      { path: 'RegressionTests/InsertSurfaceOps.xml' },
      {
        path: 'RegressionTests/InsertTimedProgression.xml',
        description:
          '\n        This simple aggregate runs for the duration specified in the Timeout Arg\n    ',
      },
      {
        path: 'RegressionTests/testAddAngularDegrees.tl',
        description: 'Test adding two angular values.',
      },
      {
        path: 'RegressionTests/testAddAngularDegrees.xml',
        description: '\n        Test adding two angular values.\n    ',
      },
      {
        path: 'RegressionTests/testAddDegrees.tl',
        description: 'Test adding two angular values.',
      },
      {
        path: 'RegressionTests/testAddDegrees.xml',
        description: '\n        Test adding two angular values.\n    ',
      },
      { path: 'RegressionTests/testAltDpthEnvPtchBehavior.tl' },
      { path: 'RegressionTests/testAltDpthEnvPtchBehavior.xml' },
      { path: 'RegressionTests/testAltitudeEnvelopeBehavior.tl' },
      { path: 'RegressionTests/testAltitudeEnvelopeBehavior.xml' },
      { path: 'RegressionTests/testAssign.tl' },
      { path: 'RegressionTests/testAssign.xml' },
      { path: 'RegressionTests/testBuoyancyBehavior.tl' },
      { path: 'RegressionTests/testBuoyancyBehavior.xml' },
      {
        path: 'RegressionTests/testCircleWaypointRepeatedly.xml',
        description:
          '\n        This is just to test functionality of\n        Insert/CircleWaypointRepeatedly.xml\n    ',
      },
      { path: 'RegressionTests/testCustomUri.xml' },
      { path: 'RegressionTests/testDepthEnvelopeBehavior.xml' },
      { path: 'RegressionTests/testDepthEnvelopeBehavior2.xml' },
      { path: 'RegressionTests/testDepthEnvelopeSurrogate.xml' },
      { path: 'RegressionTests/testDepthServo.xml' },
      { path: 'RegressionTests/testIBIT.xml' },
      { path: 'RegressionTests/testPitchServoHoldDepth.xml' },
      { path: 'RegressionTests/testPitchSetDepth.xml' },
      { path: 'RegressionTests/testPitchSetDepthSetElevatorAngle.xml' },
      { path: 'RegressionTests/testPitchSetDepthSetMassPosition.xml' },
      { path: 'RegressionTests/testPitchSetPitch.xml' },
      { path: '_examples/Science.tl' },
      { path: '_examples/StandardEnvelopes.tl' },
      { path: '_examples/Surface.tl' },
      { path: '_examples/SysLogExample.tl' },
      { path: '_examples/WithInsertExample.tl' },
      {
        path: '_examples/grid_survey.tl',
        description:
          'Vehicle uses grid waypoints generated from the dash to fly at a\nspecified depth with science turned on. One comms stop upon arrival at\nthe first waypoint.',
      },
      {
        path: '_examples/grid_survey_yoyo.tl',
        description:
          'Vehicle uses grid waypoints generated from the dash to fly at a\nspecified depth with science turned on. One comms stop upon arrival at\nthe first waypoint.',
      },
      { path: '_examples/tank_ballast_and_trim.tl' },
      { path: 'underIce/DefaultUnder.xml' },
      { path: 'underIce/DefaultUnderTimeout.xml' },
    ],
  },
}

const server = setupServer(
  rest.get('/git/missionList', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMissionList', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getMissionList(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMissionList(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
