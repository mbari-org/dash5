// Write tests for determineCommandStatus

import { determineCommandStatus, getVia } from './determineCommandStatus'
import { GetEventsResponse } from '../Event/getEvents'

describe('getVia', () => {
  it('should extract via cellsat', () => {
    expect(getVia('command[via: cellsat, timeout:60min]')).toBe('cellsat')
  })

  it('should extract via cell', () => {
    expect(getVia('command[via: cell, timeout:60min]')).toBe('cell')
  })

  it('should extract via sat', () => {
    expect(getVia('command[via: sat]')).toBe('sat')
  })

  it('should return undefined for no via', () => {
    expect(getVia('command[timeout:60min]')).toBeUndefined()
  })

  it('should return undefined for undefined note', () => {
    expect(getVia(undefined)).toBeUndefined()
  })
})

describe('determineCommandStatus', () => {
  // Common test data setup
  const baseSatCommand: GetEventsResponse = {
    isoTime: '2023-01-01T12:00:00Z',
    eventId: 1,
    name: 'command',
    note: 'command[via: sat]', // No timeout for sat commands
    mtmsn: 0,
    refId: 0,
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574400000, // Unix timestamp for 2023-01-01T12:00:00Z
    eventType: 'command',
  }

  const baseCellCommand: GetEventsResponse = {
    isoTime: '2023-01-01T12:00:00Z',
    eventId: 2,
    name: 'command',
    note: 'command[via: cell, timeout:60min]', // Timeout for cell commands
    mtmsn: 0,
    refId: 0,
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574400000,
    eventType: 'command',
  }

  const baseCellsatCommand: GetEventsResponse = {
    isoTime: '2023-01-01T12:00:00Z',
    eventId: 3,
    name: 'command',
    note: 'command[via: cellsat, timeout:60min]', // Timeout for cellsat commands
    mtmsn: 0,
    refId: 0,
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574400000,
    eventType: 'command',
  }

  const baseSbdSend: GetEventsResponse = {
    isoTime: '2023-01-01T12:01:00Z',
    eventId: 4,
    name: 'sbdSend',
    note: 'some note',
    mtmsn: 0,
    refId: 1, // References the sat command eventId
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574460000, // Unix timestamp for 2023-01-01T12:01:00Z
    eventType: 'sbdSend',
  }

  const cellSbdSend: GetEventsResponse = {
    isoTime: '2023-01-01T12:01:00Z',
    eventId: 5,
    name: 'sbdSend',
    note: 'some note',
    mtmsn: 0,
    refId: 2, // References the cell command eventId
    state: 2, // State 2 indicates cell comms
    vehicleName: 'TestVehicle',
    unixTime: 1672574460000,
    eventType: 'sbdSend',
  }

  const baseSbdReceipt: GetEventsResponse = {
    isoTime: '2023-01-01T12:02:00Z',
    eventId: 6,
    name: 'sbdReceipt',
    note: 'some receipt note',
    mtmsn: 123, // MTMSN that would be referenced by sbdReceive
    refId: 4, // References the sbdSend eventId
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574520000, // Unix timestamp for 2023-01-01T12:02:00Z
    eventType: 'sbdReceipt',
  }

  const baseSbdReceive: GetEventsResponse = {
    isoTime: '2023-01-01T12:03:00Z',
    eventId: 7,
    name: 'sbdReceive',
    note: 'some receive note',
    mtmsn: 123, // Same MTMSN as the receipt
    refId: 0,
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672574580000, // Unix timestamp for 2023-01-01T12:03:00Z
    eventType: 'sbdReceive',
  }

  const baseTimeoutEvent: GetEventsResponse = {
    isoTime: '2023-01-01T13:00:00Z',
    eventId: 8,
    name: 'note',
    note: 'id=2: Timeout while waiting', // References the cell command eventId
    mtmsn: 0,
    refId: 0,
    state: 0,
    vehicleName: 'TestVehicle',
    unixTime: 1672578000000, // Unix timestamp for 2023-01-01T13:00:00Z
    eventType: 'note',
  }

  it('should return queued status for sat command when no sbdSend exists', () => {
    const result = determineCommandStatus(
      baseSatCommand,
      new Map(),
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('queued')
    expect(result.via).toBe('sat')
    expect(result.timeout).toBeUndefined() // Sat commands don't have timeouts
    expect(result.commsIsoTime).toBe(baseSatCommand.isoTime)
  })

  it('should return sent status for sat command when sbdSend exists but no receipt/receive', () => {
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseSatCommand.eventId), baseSbdSend],
    ])

    const result = determineCommandStatus(
      baseSatCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('sent')
    expect(result.via).toBe('sat')
    expect(result.timeout).toBeUndefined() // Sat commands don't have timeouts
    expect(result.commsIsoTime).toBe(baseSbdSend.isoTime)
    // No receipt yet — no MTMSN available
    expect(result.mtmsn).toBeUndefined()
    expect(result.momsn).toBeUndefined()
  })

  it('should return ack status for sat command when sbdSend, receipt, and receive all exist', () => {
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseSatCommand.eventId), baseSbdSend],
    ])

    const sbdReceiptMap = new Map<string, GetEventsResponse>([
      [String(baseSbdSend.eventId), baseSbdReceipt],
    ])

    // Make sure mtmsn is a number (not undefined) before using as a Map key
    const receiptMtmsn = baseSbdReceipt.mtmsn as number
    const sbdReceiveMap = new Map<number, GetEventsResponse>([
      [receiptMtmsn, baseSbdReceive],
    ])

    const result = determineCommandStatus(
      baseSatCommand,
      sbdSendMap,
      sbdReceiptMap,
      sbdReceiveMap,
      new Map()
    )

    expect(result.status).toBe('ack')
    expect(result.via).toBe('sat')
    expect(result.timeout).toBeUndefined() // Sat commands don't have timeouts
    expect(result.commsIsoTime).toBe(baseSbdReceive.isoTime)
    // MTMSN from sbdReceipt (123), MOMSN from sbdReceive (not set on base — undefined)
    expect(result.mtmsn).toBe(123)
    expect(result.momsn).toBeUndefined()
  })

  it('should normalize mtmsn sentinel 0 to undefined on sat-sent status', () => {
    // When sbdReceipt.mtmsn is 0, the sent path must return mtmsn: undefined
    // rather than 0, because 0 is used as a "missing" sentinel in the API.
    const zeroMtmsnReceipt = { ...baseSbdReceipt, mtmsn: 0 }
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseSatCommand.eventId), baseSbdSend],
    ])
    const sbdReceiptMap = new Map<string, GetEventsResponse>([
      [String(baseSbdSend.eventId), zeroMtmsnReceipt],
    ])

    // No sbdReceive → stays 'sent'; mtmsn:0 on the receipt must be normalized.
    const sentResult = determineCommandStatus(
      baseSatCommand,
      sbdSendMap,
      sbdReceiptMap,
      new Map(),
      new Map()
    )
    expect(sentResult.status).toBe('sent')
    expect(sentResult.mtmsn).toBeUndefined()
  })

  it('should normalize momsn sentinel 0 to undefined on sat-ack status', () => {
    // When sbdReceive.momsn is 0, the ack path must return momsn: undefined
    // rather than 0, because 0 is used as a "missing" sentinel in the API.
    const zeroMomsnReceive = { ...baseSbdReceive, momsn: 0 }
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseSatCommand.eventId), baseSbdSend],
    ])
    const sbdReceiptMap = new Map<string, GetEventsResponse>([
      [String(baseSbdSend.eventId), baseSbdReceipt], // valid mtmsn: 123
    ])
    const sbdReceiveMap = new Map<number, GetEventsResponse>([
      [baseSbdReceipt.mtmsn as number, zeroMomsnReceive], // keyed by receipt's mtmsn
    ])

    const ackResult = determineCommandStatus(
      baseSatCommand,
      sbdSendMap,
      sbdReceiptMap,
      sbdReceiveMap,
      new Map()
    )
    expect(ackResult.status).toBe('ack')
    expect(ackResult.mtmsn).toBe(123) // valid mtmsn preserved
    expect(ackResult.momsn).toBeUndefined() // momsn:0 normalized to undefined
  })

  it('should return ack status for cell command when sbdSend exists with state 2', () => {
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseCellCommand.eventId), cellSbdSend],
    ])

    const result = determineCommandStatus(
      baseCellCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('ack')
    expect(result.via).toBe('cell')
    expect(result.timeout).toBe('60')
    expect(result.commsIsoTime).toBe(cellSbdSend.isoTime)
  })

  it('should return timeout status for cell command when timeout event exists', () => {
    const timeoutMap = new Map<string, GetEventsResponse>([
      [String(baseCellCommand.eventId), baseTimeoutEvent],
    ])

    const result = determineCommandStatus(
      baseCellCommand,
      new Map(),
      new Map(),
      new Map(),
      timeoutMap
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('cell')
    expect(result.timeout).toBe('60')
    expect(result.commsIsoTime).toBe(baseTimeoutEvent.isoTime)
  })

  it('should return timeout for cellsat command when sbdSend exists but its timeout has elapsed', () => {
    // baseSbdSend is from 2023 with a 60-minute timeout — long since expired.
    // Client-side inference should return 'timeout' instead of 'sent'.
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseCellsatCommand.eventId), baseSbdSend],
    ])

    const result = determineCommandStatus(
      baseCellsatCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('cellsat')
    expect(result.timeout).toBe('60')
  })

  it('should return sent for cellsat command when sbdSend exists and timeout has NOT yet elapsed', () => {
    const recentSbdSend: GetEventsResponse = {
      ...baseSbdSend,
      unixTime: Date.now() - 30 * 1000, // sent 30 seconds ago
      isoTime: new Date(Date.now() - 30 * 1000).toISOString(),
      refId: baseCellsatCommand.eventId,
    }
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseCellsatCommand.eventId), recentSbdSend],
    ])

    const result = determineCommandStatus(
      baseCellsatCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('sent')
    expect(result.via).toBe('cellsat')
    expect(result.timeout).toBe('60')
    expect(result.commsIsoTime).toBe(recentSbdSend.isoTime)
  })

  it('should return timeout for a queued cell command whose timeout window has elapsed (no backend note needed)', () => {
    // Command created 2 hours ago with a 5-minute timeout — definitively timed out.
    // No sbdSend (never dispatched) and no backend timeout note.
    const expiredQueuedCommand: GetEventsResponse = {
      ...baseCellCommand,
      unixTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      note: '[[via:cell, timeout:5min]]',
    }

    const result = determineCommandStatus(
      expiredQueuedCommand,
      new Map(),
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('cell')
    expect(result.timeout).toBe('5')
  })

  it('should return queued for a cell command whose timeout has NOT yet elapsed', () => {
    const recentQueuedCommand: GetEventsResponse = {
      ...baseCellCommand,
      unixTime: Date.now() - 30 * 1000, // 30 seconds ago, timeout is 60 min
    }

    const result = determineCommandStatus(
      recentQueuedCommand,
      new Map(),
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('queued')
    expect(result.via).toBe('cell')
  })

  it('should handle commands with no via', () => {
    const noViaCommand = {
      ...baseCellCommand,
      note: 'command[timeout:60min]', // No via specified
    }

    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(noViaCommand.eventId), baseSbdSend],
    ])

    const result = determineCommandStatus(
      noViaCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      new Map()
    )

    expect(result.status).toBe('ack')
    expect(result.via).toBeUndefined()
    expect(result.timeout).toBe('60')
    expect(result.commsIsoTime).toBe(baseSbdSend.isoTime)
  })

  it('should return timeout (not ack) for cell command with state:2 sbdSend when timeout note exists', () => {
    // Regression for #597: a cell command dispatched via state:2 sbdSend was
    // incorrectly shown as 'received by vehicle' even when the vehicle never
    // fetched it and a timeout note existed for the same eventId.
    // Timeout is ground-truth for queue-and-fetch cell delivery.
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseCellCommand.eventId), cellSbdSend],
    ])
    const timeoutMap = new Map<string, GetEventsResponse>([
      [String(baseCellCommand.eventId), baseTimeoutEvent],
    ])

    const result = determineCommandStatus(
      baseCellCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      timeoutMap
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('cell')
    expect(result.commsIsoTime).toBe(baseTimeoutEvent.isoTime)
    expect(result.mtmsn).toBeUndefined()
    expect(result.momsn).toBeUndefined()
  })

  it('should return timeout (not ack) for cellsat command with state:2 sbdSend when timeout note exists', () => {
    // Same scenario via 'cellsat': the earlier timeout guard required via==='cell',
    // so cellsat commands would bypass it and incorrectly fall through to 'ack'.
    const cellsatSbdSend: GetEventsResponse = {
      ...cellSbdSend,
      eventId: 50,
      refId: baseCellsatCommand.eventId, // references eventId 3
      state: 2,
    }
    const cellsatTimeoutEvent: GetEventsResponse = {
      ...baseTimeoutEvent,
      eventId: 51,
      note: `id=${baseCellsatCommand.eventId}: Timeout while waiting`,
    }
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseCellsatCommand.eventId), cellsatSbdSend],
    ])
    const timeoutMap = new Map<string, GetEventsResponse>([
      [String(baseCellsatCommand.eventId), cellsatTimeoutEvent],
    ])

    const result = determineCommandStatus(
      baseCellsatCommand,
      sbdSendMap,
      new Map(),
      new Map(),
      timeoutMap
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('cellsat')
    expect(result.commsIsoTime).toBe(cellsatTimeoutEvent.isoTime)
    expect(result.mtmsn).toBeUndefined()
    expect(result.momsn).toBeUndefined()
  })

  it('should return timeout (not sent) for sat command with sbdSend state:1 when timeout note exists', () => {
    // Regression for #604: sat comms bypass the original cell-only timeout guard and
    // fall through to 'sent' (sbdSend exists, no sbdReceive). A timeout note is ground
    // truth regardless of via type — the command must return 'timeout'.
    const satCommandWithTimeout: GetEventsResponse = {
      ...baseSatCommand,
      note: 'command[via: sat, timeout:30min]',
    }
    const satSbdSend: GetEventsResponse = {
      ...baseSbdSend,
      eventId: 60,
      refId: satCommandWithTimeout.eventId,
      state: 1, // sent to Iridium, but vehicle never responded
    }
    const satTimeoutEvent: GetEventsResponse = {
      ...baseTimeoutEvent,
      eventId: 61,
      note: `id=${satCommandWithTimeout.eventId}: Timeout while waiting`,
    }
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(satCommandWithTimeout.eventId), satSbdSend],
    ])
    const timeoutMap = new Map<string, GetEventsResponse>([
      [String(satCommandWithTimeout.eventId), satTimeoutEvent],
    ])

    const result = determineCommandStatus(
      satCommandWithTimeout,
      sbdSendMap,
      new Map(),
      new Map(),
      timeoutMap
    )

    expect(result.status).toBe('timeout')
    expect(result.via).toBe('sat')
    expect(result.commsIsoTime).toBe(satTimeoutEvent.isoTime)
    expect(result.mtmsn).toBeUndefined()
    expect(result.momsn).toBeUndefined()
  })

  it('should handle missing receipt mtmsn', () => {
    const sbdSendMap = new Map<string, GetEventsResponse>([
      [String(baseSatCommand.eventId), baseSbdSend],
    ])

    const receiptWithNoMtmsn = {
      ...baseSbdReceipt,
      mtmsn: 0,
    }

    const sbdReceiptMap = new Map<string, GetEventsResponse>([
      [String(baseSbdSend.eventId), receiptWithNoMtmsn],
    ])

    const result = determineCommandStatus(
      baseSatCommand,
      sbdSendMap,
      sbdReceiptMap,
      new Map(),
      new Map()
    )

    expect(result.status).toBe('sent')
  })
})
