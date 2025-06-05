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

  it('should handle cellsat commands properly', () => {
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

    expect(result.status).toBe('sent')
    expect(result.via).toBe('cellsat')
    expect(result.timeout).toBe('60')
    expect(result.commsIsoTime).toBe(baseSbdSend.isoTime)
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
