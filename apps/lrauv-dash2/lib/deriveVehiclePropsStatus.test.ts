import { deriveVehiclePropsStatus } from './deriveVehiclePropsStatus'

describe('deriveVehiclePropsStatus', () => {
  describe('recovered precedence', () => {
    test('returns "recovered" when recoverEventId is present', () => {
      expect(
        deriveVehiclePropsStatus({ recoverEventId: 42, missionText: '' })
      ).toBe('recovered')
    })

    test('returns "recovered" when missionText contains RECOVERED', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: null,
          missionText: 'RECOVERED',
        })
      ).toBe('recovered')
    })

    test('RECOVERED beats PLUGGED in missionText', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: null,
          missionText: 'RECOVERED PLUGGED',
        })
      ).toBe('recovered')
    })

    test('recoverEventId beats PLUGGED in missionText', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: 1,
          missionText: 'PLUGGED',
        })
      ).toBe('recovered')
    })
  })

  describe('pluggedIn', () => {
    test('returns "pluggedIn" when missionText contains PLUGGED and no recovery', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: null,
          missionText: 'PLUGGED IN',
        })
      ).toBe('pluggedIn')
    })

    test('does not treat empty recoverEvent (no eventId) as recovered', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: undefined,
          missionText: 'PLUGGED',
        })
      ).toBe('pluggedIn')
    })
  })

  describe('onMission', () => {
    test('returns "onMission" when no recovery or plugged indicators', () => {
      expect(
        deriveVehiclePropsStatus({
          recoverEventId: null,
          missionText: 'started sci2.xml',
        })
      ).toBe('onMission')
    })

    test('returns "onMission" when missionText is empty', () => {
      expect(
        deriveVehiclePropsStatus({ recoverEventId: null, missionText: '' })
      ).toBe('onMission')
    })

    test('returns "onMission" when missionText is null', () => {
      expect(
        deriveVehiclePropsStatus({ recoverEventId: null, missionText: null })
      ).toBe('onMission')
    })
  })
})
