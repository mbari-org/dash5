import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getFrequentRuns, GetFrequentRunsParams } from './getFrequentRuns'

let params: GetFrequentRunsParams = {
  vehicle: 'example',
}

const mockResponse = {
  result: [
    'run Maintenance/tank_ballast_and_trim.xml',
    'load Science/circle_acoustic_contact.xml;set circle_acoustic_contact.ContactLabel 9 count;set circle_acoustic_contact.TrackingUpdatePeriod 15 second;run ',
    'run Engineering/joystick_backseat.xml',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.NumSamplers 2 count;set IsothermDepthSampling.MissionTimeout 6 h;set IsothermDepthSampling.MaxWaitNoFiring 1 h;set IsothermDepthSampling.MaxWaitNotAchievingDepth 0.5 h;set IsothermDepthSampling.SendSampleStatusAndData 0 bool;set IsothermDepthSampling.SampleAtPeakChl 1 bool;set IsothermDepthSampling.InitialDiveDuration 1 min;set IsothermDepthSampling.HeadingLeavingSide0 210 degree;set IsothermDepthSampling.HeadingLeavingSide2 30 degree;set IsothermDepthSampling.HeadingLeavingSide3 120 degree;set IsothermDepthSampling.MaxDepth 30 m;set IsothermDepthSampling.MinAltitude 5 m;set IsothermDepthSampling.MinOffshore 1.5 km;set IsothermDepthSampling.ShallowBoundChl 2 m;set IsothermDepthSampling.DeepBoundChl 27 m;set IsothermDepthSampling.CartridgeTypeCommon -6 count;set IsothermDepthSampling.CartridgeType1 -6 count;set IsothermDepthSampling.CartridgeType2 -6 count;set IsothermDepthSampling.DepDiffFromPeakChl1 0 m;set IsothermDepthSampling.DepDiffFromPeakChl2 0 m;set IsothermDepthSampling.WaitDepUndulation1 20.0 min;set IsothermDepthSampling.WaitDepUndulation2 5 min;run;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.MissionTimeout 3 h;set IsothermDepthSampling.MaxWaitNoFiring 1 h;set IsothermDepthSampling.MaxWaitNotAchievingDepth 0.5 h;set IsothermDepthSampling.SendSampleStatusAndData 0 bool;set IsothermDepthSampling.SampleAtPeakChl 1 bool;set IsothermDepthSampling.InitialDiveDuration 1 min;set IsothermDepthSampling.HeadingLeavingSide1 210 degree;set IsothermDepthSampling.HeadingLeavingSide2 270 degree;set IsothermDepthSampling.HeadingLeavingSide3 30 degree;set IsothermDepthSampling.HeadingLeavingSide4 120 degree;set IsothermDepthSampling.MaxDepth 30 m;set IsothermDepthSampling.MinOffshore 4 km;set IsothermDepthSampling.ShallowBoundChl 2 m;set IsothermDepthSampling.CartridgeTypeCommon -6 count;set IsothermDepthSampling.CartridgeType1 -6 count;set IsothermDepthSampling.DepDiffFromPeakChl1 0 m;set IsothermDepthSampling.WaitDepUndulation1 10.0 min;run;',
    'load Science/esp_sample_at_depth.xml;set esp_sample_at_depth.MissionTimeout 3.5 h;set esp_sample_at_depth.TargetDepth 2.5 m;set esp_sample_at_depth.ESPCartridgeType_2 -18 count;set esp_sample_at_depth.ApproachSpeed 0 m/s;set esp_sample_at_depth.MinAltitude 1 m;set esp_sample_at_depth.MaxDepth 4.8 m;run;',
    'run Maintenance/ballast_and_trim.xml',
    'load Science/esp_sample_at_threshold.xml;set esp_sample_at_threshold.chlorophyllLowerBound 6 ug/l;set esp_sample_at_threshold.chlorophyllUpperBound 100 ug/l;set esp_sample_at_threshold.Lat1 41.837133 degree;set esp_sample_at_threshold.Lon1 -83.351648 degree;set esp_sample_at_threshold.Speed 0.8 m/s;set esp_sample_at_threshold.YoYoMinDepth 1.5 m;set esp_sample_at_threshold.YoYoMaxDepth 2.5 m;set esp_sample_at_threshold.YoYoMinAltitude 2 m;set esp_sample_at_threshold.YoYoUpPitch 12 degree;set esp_sample_at_threshold.YoYoDownPitch -12 degree;set esp_sample_at_threshold.TargetDepth 2.5 m;set esp_sample_at_threshold.ESPCartridgeType_2 -18 count;set esp_sample_at_threshold.MinAltitude 0.5 m;set esp_sample_at_threshold.MaxDepth 4.5 m;run;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MissionTimeout 6 h;set trackPatch_yoyo.MaxDepth 30 m;set trackPatch_yoyo.MinOffshore 1500 m;set trackPatch_yoyo.WpMaxDistance 1000 m;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 30 m;set trackPatch_yoyo.PeakShallowBnd 2 m;set trackPatch_yoyo.PeakDeepBnd 30 m;run;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.InitialDiveDuration 5.0 second;set IsothermDepthSampling.SpeedSampling 0 meter_per_second;set IsothermDepthSampling.ESPCartridgeType1 -4 count;set IsothermDepthSampling.Dep1 5 meter;set IsothermDepthSampling.WaitDepUndulation1 10 second;run ;',
    'load Science/isotherm_depth_sampling.xml;set DriftOrDonutAtIsothermOrDepth.InitialDiveDuration 5.0 second;set DriftOrDonutAtIsothermOrDepth.SpeedSampling 0 meter_per_second;set DriftOrDonutAtIsothermOrDepth.MinAltitude 0.0001 meter;set DriftOrDonutAtIsothermOrDepth.MinOffshore 0.0001 kilometer;set DriftOrDonutAtIsothermOrDepth.Dep1 5 meter;set DriftOrDonutAtIsothermOrDepth.WaitDepUndulation1 10 second;run ;',
    'load Science/esp_sample_at_depth.xml;set esp_sample_at_depth.MissionTimeout 3.5 h;set esp_sample_at_depth.TargetDepth 2.0 m;set esp_sample_at_depth.ESPCartridgeType_2 -18 count;set esp_sample_at_depth.ApproachSpeed 0 m/s;set esp_sample_at_depth.MinAltitude 1 m;set esp_sample_at_depth.MaxDepth 4.8 m;set esp_sample_at_depth:StandardEnvelopes.MinAltitude 3 m;run;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.InitialDiveDuration 5.0 second;set IsothermDepthSampling.SpeedSampling 0 meter_per_second;set IsothermDepthSampling.Dep1 5 meter;set IsothermDepthSampling.Dep2 5 meter;set IsothermDepthSampling.WaitDepUndulation1 10.0 second;run ;',
    'load Transport/keepstation.tl;set keepstation.MissionTimeout 10 h;set keepstation.NeedCommsTime 45 min;set keepstation.Depth 15 m;set keepstation.Radius 400 m;set keepstation.MaxDepth 25 m;set keepstation.MinOffshore 1 km;run',
    'load Science/profile_station.xml;set profile_station.MissionTimeout 20 minute;set profile_station.NeedCommsTime 20 minute;set profile_station.Lat 36.7601 degree;set profile_station.Lon -122.0169 degree;set profile_station.YoYoMinDepth 5 meter;set profile_station.YoYoMaxDepth 35 meter;set profile_station.Speed 0.85 meter_per_second;set profile_station.MaxDepth 45 meter;run ;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.NumESPSamplers 2 count;set IsothermDepthSampling.MissionTimeout 6 hour;set IsothermDepthSampling.NeedCommsTimeInTransect 30 minute;set IsothermDepthSampling.MaxWaitNoFiring 50000 day;set IsothermDepthSampling.MaxWaitNotAchievingDepth 50000 day;set IsothermDepthSampling.SendESPStatusAndData 0 bool;set IsothermDepthSampling.InitialDiveDuration 2 minute;set IsothermDepthSampling.PeriodOfSampleSetting 50000 day;set IsothermDepthSampling.SpeedTransit 0.65 meter_per_second;set IsothermDepthSampling.SpeedInitialDive 0.65 meter_per_second;set IsothermDepthSampling.SpeedSampling 0 meter_per_second;set IsothermDepthSampling.MaxDepth 60 meter;set IsothermDepthSampling.DeepBoundESP 60 meter;set IsothermDepthSampling.TransitYoYoMinDepth 5 meter;set IsothermDepthSampling.TransitYoYoMaxDepth 20 meter;set IsothermDepthSampling.Lat1 36.797 degree;set IsothermDepthSampling.Lon1 -121.847 degree;set IsothermDepthSampling.CartridgeType1 -6 count;set IsothermDepthSampling.CartridgeType2 -6 count;set IsothermDepthSampling.Dep1 7 meter;set IsothermDepthSampling.Dep2 50 meter;set IsothermDepthSampling.WaitDepUndulation2 20.0 minute;run ;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MaxDepth 25 m;set trackPatch_yoyo.MinOffshore 4000 m;set trackPatch_yoyo.NeedCommsTimePatchTracking 60 min;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 20 m;set trackPatch_yoyo.PeakShallowBnd 2 m;run;',
    'load Maintenance/tank_ballast_and_trim.xml;set ballast_and_trim.MissionTimeout 90 minute;set ballast_and_trim.SettleTime 7 minute;set ballast_and_trim.EstimationTimeout 35 minute;set ballast_and_trim.MassEstimationErrorBound 1 millimeter;set ballast_and_trim.BuoyEstimationErrorBound 35 cubic_centimeter;set ballast_and_trim.EstimationConfidence 95.0 percent;run;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MissionTimeout 8 h;set trackPatch_yoyo.MinAltitude 1 m;set trackPatch_yoyo.MaxDepth 5 m;set trackPatch_yoyo.MinWaterDepth 4 m;set trackPatch_yoyo.MinOffshore 1500 m;set trackPatch_yoyo.NeedCommsTimePatchTracking 120 min;set trackPatch_yoyo.Speed 0.8 m/s;set trackPatch_yoyo.WpMaxDistance 1500 m;set trackPatch_yoyo.TransitYoYoMinDepth 1.5 m;set trackPatch_yoyo.TransitYoYoMaxDepth 3 m;set trackPatch_yoyo.PatchTrackingYoYoMinDepth 1.5 m;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 3 m;set trackPatch_yoyo.YoYoMinAltitude 2 m;set trackPatch_yoyo.YoYoUpPitch 12 degree;set trackPatch_yoyo.YoYoDownPitch -12 degree;set trackPatch_yoyo.PeakShallowBnd 1.5 m;set trackPatch_yoyo.PeakDeepBnd 3 m;set trackPatch_yoyo.OffPeakFraction 90 %;set trackPatch_yoyo.DepChangeThreshAttitudeFlip 0.5 m;set trackPatch_yoyo:Science.DepChangeThreshForAttitudeFlip 0.5 m;run;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MissionTimeout 6 h;set trackPatch_yoyo.MaxDepth 35 m;set trackPatch_yoyo.MinOffshore 2000 m;set trackPatch_yoyo.NeedCommsTimePatchTracking 300 min;set trackPatch_yoyo.NeedCommsTimeMarginPatchTracking 60 min;set trackPatch_yoyo.NumRoundsBtnCrossLegSurfacings 5 count;set trackPatch_yoyo.WpMaxDistance 1000 m;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 30 m;set trackPatch_yoyo.PeakShallowBnd 2 m;set trackPatch_yoyo.PeakDeepBnd 30 m;run;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MissionTimeout 6 h;set trackPatch_yoyo.MaxDepth 30 m;set trackPatch_yoyo.MinOffshore 1500 m;set trackPatch_yoyo.Repeat 7 count;set trackPatch_yoyo.NumRoundsBtnCrossLegSurfacings 7 count;set trackPatch_yoyo.WpMaxDistance 1000 m;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 25 m;set trackPatch_yoyo.PeakShallowBnd 2 m;set trackPatch_yoyo.PeakDeepBnd 20 m;run;',
    'load Science/sci2.tl;set sci2.MissionTimeout 10 min;set sci2.NeedCommsTime 10 min;set sci2.Lat1 43.231209 degree;set sci2.Lon1 -86.432818 degree;set sci2.YoYoMaxDepth 5 m;set sci2.YoYoMinAltitude 5 m;set sci2.MinAltitude 3 m;set sci2.MaxDepth 10 m;set sci2.MinOffshore 0.5 km;run;',
    'load Maintenance/sample_lab.xml;set sample_lab.CartridgeType -18 count;run',
    'load Science/sci2.xml;set sci2.MissionTimeout 1 h;set sci2.NeedCommsTime 5 min;set sci2.Lat1 34.397 degree;set sci2.Lon1 -119.8 degree;set sci2.YoYoMinDepth 0 m;set sci2.YoYoMaxDepth 2 m;set sci2.YoYoMinAltitude 4 m;set sci2.YoYoUpPitch 15 degree;set sci2.YoYoDownPitch -15 degree;set sci2.MinAltitude 3 m;set sci2.MaxDepth 4 m;set sci2.MinOffshore 10 m;run;',
    'load Science/smear_waypoint_sampling.xml;set Smear.CartridgeType -1 count;set Smear.MissionTimeout 8 h;set Smear.WaitDuration 15 min;set Smear.NeedCommsTimeInTransit 45 min;set Smear.MaxWaitNoFiring 30 min;set Smear.ReachEndWaypoint 0 bool;set Smear.SamplingYoYoMinDepth 40 m;set Smear.SamplingYoYoMaxDepth 70 m;set Smear.SamplingEndLatitude 43.615626 degree;set Smear.SamplingEndLongitude -87.200960 degree;set Smear.YoYoUpPitch 12 degree;set Smear.YoYoDownPitch -12 degree;set Smear.NeedCommsTimeVeryLong 8 h;run;',
    'load Science/isotherm_depth_sampling.xml;set DriftOrDonutAtIsothermOrDepth.Dep1 5 meter;run ',
    'load Science/esp_sample_at_depth.xml;set esp_sample_at_depth.MissionTimeout 3.5 h;set esp_sample_at_depth.TargetDepth 2.5 m;set esp_sample_at_depth.ESPCartridgeType_2 -18 count;set esp_sample_at_depth.ApproachSpeed 0 m/s;set esp_sample_at_depth.MinAltitude 1 m;set esp_sample_at_depth.MaxDepth 4.8 m;set esp_sample_at_depth:StandardEnvelopes.MinAltitude 3 m;run;',
    'load Science/esp_sample_at_depth.xml;set esp_sample_at_depth.ESPCartridgeType_2 -4 count;set esp_sample_at_depth.ESPCartridgeType_3 -4 count;set esp_sample_at_depth.ESPCartridgeType_4 -4 count;set esp_sample_at_depth.SettleTime 10 second;set esp_sample_at_depth.ApproachSettleTimePreDive 1.5 second;set esp_sample_at_depth.ApproachSettleTimePostDive 5 second;run ;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.InitialDiveDuration 5.0 second;set IsothermDepthSampling.Dep1 5 meter;set IsothermDepthSampling.WaitDepUndulation1 10.0 second;run ',
    'load Maintenance/ballast_and_trim.xml;set ballast_and_trim.MissionTimeout 60 min;set ballast_and_trim.Depth1 3 m;set ballast_and_trim.ApproachSpeed 0 m/s;set ballast_and_trim.ApproachDepthRate 0.1 m/s;set ballast_and_trim.ApproachPitchLimit 10 degree;set ballast_and_trim.ApproachSettleTimePreDive 1 min;set ballast_and_trim.EstimationTimeout 2 h;set ballast_and_trim.MinEstimationTime 61 min;set ballast_and_trim.MinAltitude 2 m;set ballast_and_trim.MaxDepth 4 m;set ballast_and_trim.MinOffshore 1 km;run;',
    'load Maintenance/ballast_and_trim.xml;set ballast_and_trim.Depth1 3 m;set ballast_and_trim.ApproachDepthRate 0.1 m/s;set ballast_and_trim.ApproachPitchLimit 10 degree;set ballast_and_trim.ApproachSettleTimePreDive 1 min;set ballast_and_trim.EstimationTimeout 2 h;set ballast_and_trim.MinEstimationTime 30 min;set ballast_and_trim.MinAltitude 1 m;set ballast_and_trim.MaxDepth 5 m;set ballast_and_trim.MinOffshore 1 km;run;',
    'load Maintenance/sample_lab.xml;set sample_lab.CartridgeType -1 count;run',
    'load Science/sci2.tl;set sci2.MissionTimeout 4 h;set sci2.NeedCommsTime 30 min;set sci2.Lat1 43.615626 degree;set sci2.Lon1 -86.931045 degree;set sci2.Speed 0.8 m/s;set sci2.YoYoMaxDepth 50 m;set sci2.YoYoMinAltitude 15 m;set sci2.MinAltitude 7 m;set sci2.MaxDepth 60 m;set sci2.MinOffshore 2 km;run;',
    'load Science/isotherm_depth_sampling.xml;set IsothermDepthSampling.MissionTimeout 3 h;set IsothermDepthSampling.MaxWaitNoFiring 1 h;set IsothermDepthSampling.MaxWaitNotAchievingDepth 0.5 h;set IsothermDepthSampling.SendSampleStatusAndData 0 bool;set IsothermDepthSampling.SampleAtPeakChl 1 bool;set IsothermDepthSampling.InitialDiveDuration 1 min;set IsothermDepthSampling.HeadingLeavingSide0 210 degree;set IsothermDepthSampling.HeadingLeavingSide2 30 degree;set IsothermDepthSampling.HeadingLeavingSide3 120 degree;set IsothermDepthSampling.MaxDepth 40 m;set IsothermDepthSampling.MinOffshore 2 km;set IsothermDepthSampling.ShallowBoundChl 2 m;set IsothermDepthSampling.DeepBoundChl 27 m;set IsothermDepthSampling.CartridgeTypeCommon -6 count;set IsothermDepthSampling.CartridgeType1 -6 count;set IsothermDepthSampling.DepDiffFromPeakChl1 0 m;set IsothermDepthSampling.WaitDepUndulation1 10.0 min;run;',
    'load Science/trackPatch_yoyo.xml;set trackPatch_yoyo.MissionTimeout 5 h;set trackPatch_yoyo.MaxDepth 25 m;set trackPatch_yoyo.MinOffshore 4000 m;set trackPatch_yoyo.NeedCommsTimePatchTracking 60 min;set trackPatch_yoyo.WpMaxDistance 2000 m;set trackPatch_yoyo.PatchTrackingYoYoMaxDepth 20 m;set trackPatch_yoyo.PeakShallowBnd 2 m;run;',
  ],
}

const server = setupServer(
  rest.get('/commands/frequent/runs', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getFrequentRuns', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getFrequentRuns(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/frequent/runs', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getFrequentRuns(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
