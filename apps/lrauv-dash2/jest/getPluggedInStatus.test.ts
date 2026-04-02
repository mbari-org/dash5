import { DateTime } from 'luxon'
import { getPluggedInStatus } from '../lib/getPluggedInStatus'

describe('getPluggedInStatus', () => {
  it('returns true when recoverEvent is present', () => {
    expect(
      getPluggedInStatus({ recoverEvent: { unixTime: 1, eventId: 1 } })
    ).toBe(true)
  })

  it('returns true when start is in the future', () => {
    const future = DateTime.now().plus({ hours: 1 }).toMillis()
    expect(
      getPluggedInStatus({
        recoverEvent: undefined,
        startEventUnix: future,
      })
    ).toBe(true)
  })

  it('returns false when no recover and start is in the past', () => {
    const past = DateTime.now().minus({ hours: 1 }).toMillis()
    expect(
      getPluggedInStatus({
        recoverEvent: undefined,
        startEventUnix: past,
      })
    ).toBe(false)
  })
})
