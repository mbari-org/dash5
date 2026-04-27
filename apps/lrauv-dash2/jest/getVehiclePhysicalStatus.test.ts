import {
  COMMUNICATION_RECENCY_MS,
  getVehiclePhysicalStatus,
} from '../lib/getVehiclePhysicalStatus'

const now = 1_700_000_000_000

const baseInput = {
  pingReachable: false as boolean | null | undefined,
  lastSatCommsTime: null as number | null,
  lastCellCommsTime: null as number | null,
  nowMs: now,
  recoverEvent: undefined,
  startEventUnix: undefined as number | null | undefined,
}

describe('getVehiclePhysicalStatus', () => {
  describe('isLikelySurfaced / comms recency', () => {
    it('returns surfaced when pingReachable is true', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        pingReachable: true,
      })
      expect(r.isLikelySurfaced).toBe(true)
      expect(r.physicalStatus).toBe('surfaced')
    })

    it('returns surfaced when last cell is within recency window', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        lastCellCommsTime: now - COMMUNICATION_RECENCY_MS / 2,
      })
      expect(r.isLikelySurfaced).toBe(true)
      expect(r.physicalStatus).toBe('surfaced')
    })

    it('returns surfaced when last sat is within recency window', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        lastSatCommsTime: now - 60_000,
      })
      expect(r.isLikelySurfaced).toBe(true)
      expect(r.physicalStatus).toBe('surfaced')
    })

    it('returns underwater when ping is false and both comms are stale', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        lastSatCommsTime: now - COMMUNICATION_RECENCY_MS - 1,
        lastCellCommsTime: now - COMMUNICATION_RECENCY_MS - 1,
      })
      expect(r.isLikelySurfaced).toBe(false)
      expect(r.physicalStatus).toBe('underwater')
    })

    it('returns underwater when only future-dated comms exist (clock skew)', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        lastSatCommsTime: now + 60_000,
        lastCellCommsTime: now + 60_000,
      })
      expect(r.isLikelySurfaced).toBe(false)
      expect(r.physicalStatus).toBe('underwater')
    })
  })

  describe('isPluggedIn', () => {
    it('returns pluggedIn when recoverEvent is present', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        recoverEvent: { unixTime: 1, eventId: 1 },
      })
      expect(r.isPluggedIn).toBe(true)
      expect(r.physicalStatus).toBe('pluggedIn')
    })

    it('returns pluggedIn when start is in the future vs nowMs', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        startEventUnix: now + 3_600_000,
      })
      expect(r.isPluggedIn).toBe(true)
      expect(r.physicalStatus).toBe('pluggedIn')
    })

    it('returns not plugged in when no recover and start is in the past', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        startEventUnix: now - 3_600_000,
      })
      expect(r.isPluggedIn).toBe(false)
    })
  })

  describe('precedence', () => {
    it('pluggedIn wins over surfaced comms/pings', () => {
      const r = getVehiclePhysicalStatus({
        ...baseInput,
        recoverEvent: { unixTime: 1, eventId: 1 },
        pingReachable: true,
        lastCellCommsTime: now - 1_000,
      })
      expect(r.physicalStatus).toBe('pluggedIn')
    })
  })
})
