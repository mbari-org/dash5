import {
  COMMUNICATION_RECENCY_MS,
  isEffectivelyCommunicating,
} from '../lib/effectiveVehicleComms'

const now = 1_700_000_000_000

describe('isEffectivelyCommunicating', () => {
  it('returns true when pingReachable is true', () => {
    expect(
      isEffectivelyCommunicating({
        pingReachable: true,
        lastSatCommsTime: null,
        lastCellCommsTime: null,
        nowMs: now,
      })
    ).toBe(true)
  })

  it('returns true when last cell is within recency window', () => {
    expect(
      isEffectivelyCommunicating({
        pingReachable: false,
        lastSatCommsTime: null,
        lastCellCommsTime: now - COMMUNICATION_RECENCY_MS / 2,
        nowMs: now,
      })
    ).toBe(true)
  })

  it('returns true when last sat is within recency window', () => {
    expect(
      isEffectivelyCommunicating({
        pingReachable: false,
        lastSatCommsTime: now - 60_000,
        lastCellCommsTime: null,
        nowMs: now,
      })
    ).toBe(true)
  })

  it('returns false when ping is false and both comms are stale', () => {
    expect(
      isEffectivelyCommunicating({
        pingReachable: false,
        lastSatCommsTime: now - COMMUNICATION_RECENCY_MS - 1,
        lastCellCommsTime: now - COMMUNICATION_RECENCY_MS - 1,
        nowMs: now,
      })
    ).toBe(false)
  })

  it('returns false when only future-dated comms exist (clock skew)', () => {
    expect(
      isEffectivelyCommunicating({
        pingReachable: false,
        lastSatCommsTime: now + 60_000,
        lastCellCommsTime: now + 60_000,
        nowMs: now,
      })
    ).toBe(false)
  })
})
