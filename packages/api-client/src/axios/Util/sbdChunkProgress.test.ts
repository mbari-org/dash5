import {
  parseSbdChunkTotal,
  countDeliveredSbdChunks,
  buildSbdChunkProgress,
  isSbdChunkDelivered,
} from './sbdChunkProgress'
import { GetEventsResponse } from '../Event/getEvents'

const send = (
  eventId: number,
  state: number,
  refId = 1
): GetEventsResponse => ({
  isoTime: '2023-01-01T12:00:00Z',
  eventId,
  name: 'sbdSend',
  note: '',
  mtmsn: 0,
  refId,
  state,
  vehicleName: 'triton',
  unixTime: 1,
  eventType: 'sbdSend',
})

describe('parseSbdChunkTotal', () => {
  it('reads total from Mission Request part tags', () => {
    const text = [
      'sched asap "load x.tl;set a 1 m" 38kk8 1 3',
      'sched asap "set b 2 m" 38kk8 2 3',
      'sched asap "run" 38kk8 3 3',
    ].join('\n')
    expect(parseSbdChunkTotal(text)).toBe(3)
  })

  it('returns undefined for single-part or missing tags', () => {
    expect(parseSbdChunkTotal('load Science/sci2.tl;run')).toBeUndefined()
    expect(parseSbdChunkTotal('')).toBeUndefined()
    expect(parseSbdChunkTotal(undefined)).toBeUndefined()
  })
})

describe('isSbdChunkDelivered / countDeliveredSbdChunks', () => {
  it('counts cell state:2 as delivered', () => {
    const sends = [send(10, 2), send(11, 0)]
    expect(countDeliveredSbdChunks(sends, new Map(), new Map())).toBe(1)
  })

  it('counts sat receipt+receive as delivered', () => {
    const s = send(20, 0)
    const receipt: GetEventsResponse = {
      ...send(21, 0),
      eventType: 'sbdReceipt',
      eventId: 21,
      mtmsn: 99,
      name: 'sbdReceipt',
    }
    const receive: GetEventsResponse = {
      ...send(22, 0),
      eventType: 'sbdReceive',
      eventId: 22,
      mtmsn: 99,
    }
    expect(
      isSbdChunkDelivered(
        s,
        new Map([['20', receipt]]),
        new Map([[99, receive]])
      )
    ).toBe(true)
  })
})

describe('buildSbdChunkProgress', () => {
  it('returns delivered/total for multi-part commands', () => {
    const text = 'sched asap "load x.tl" id 1 3\nsched asap "run" id 2 3'
    const progress = buildSbdChunkProgress(
      text,
      [send(1, 2), send(2, 0)],
      new Map(),
      new Map()
    )
    expect(progress).toEqual({ delivered: 1, total: 3 })
  })
})
