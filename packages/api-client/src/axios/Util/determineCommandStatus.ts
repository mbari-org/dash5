import { GetEventsResponse } from '../Event/getEvents'
import { buildSbdChunkProgress, SbdChunkProgress } from './sbdChunkProgress'

export interface CommsEvent extends GetEventsResponse {
  status: 'queued' | 'sent' | 'ack' | 'timeout'
  via?: 'cellsat' | 'cell' | 'sat'
  commsIsoTime?: string
  timeout?: string
  /** Mobile Terminated Message Sequence Number — Iridium ID of the command sent to the vehicle (sat comms) */
  mtmsn?: number
  /** Mobile Originated Message Sequence Number — Iridium ID of the vehicle's acknowledgment reply (sat comms) */
  momsn?: number
  /** Multi-SBD progress when Mission Request is split across parts (#797). */
  sbdChunks?: SbdChunkProgress
}

export type SbdSendMapValue = GetEventsResponse | GetEventsResponse[]

export const digitsForIdRegEx = /\d+/
export const timeoutRegEx = /timeout:(\d+)min/
export const timeoutExpiredRegEx = /id=(\d+):\s*Timeout while waiting/
export const viaRegEx = /via:\s*(cellsat|cell|sat)(?:,|\])/

export const getVia = (note?: string) =>
  note?.match(viaRegEx)?.[1] as 'cellsat' | 'cell' | 'sat' | undefined

const asSbdSendList = (
  value: SbdSendMapValue | undefined
): GetEventsResponse[] => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/** Prefer a cell (state 2) send when present; otherwise the latest send. */
const pickPrimarySbdSend = (
  sends: GetEventsResponse[]
): GetEventsResponse | undefined =>
  sends.find((s) => s.state === 2) ?? sends[sends.length - 1]

/**
 * ACK is only honest when all known SBD parts are delivered (#797).
 * Incomplete multi-part → demote ack to sent; attach progress for UI boxes.
 */
const withChunkGate = (
  event: CommsEvent,
  sbdChunks?: SbdChunkProgress
): CommsEvent => {
  if (!sbdChunks) return event
  if (event.status === 'ack' && sbdChunks.delivered < sbdChunks.total) {
    return { ...event, status: 'sent', sbdChunks }
  }
  return { ...event, sbdChunks }
}

export const determineCommandStatus = (
  command: GetEventsResponse,
  sbdSendMap: Map<string, SbdSendMapValue>,
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  timeoutMap: Map<string, GetEventsResponse>
): CommsEvent => {
  const via = getVia(command.note)

  const timeout = command.note
    ? (command.note.match(timeoutRegEx) || [])[1]
    : undefined

  const matchingSbdSends = command.eventId
    ? asSbdSendList(sbdSendMap.get(String(command.eventId)))
    : []

  const sbdChunks = buildSbdChunkProgress(
    command.data ?? command.text,
    matchingSbdSends,
    sbdReceiptMap,
    sbdReceiveMap
  )

  // A timeout note is ground truth for any comms type (cell, sat, cellsat, unknown).
  // Check it first — before sbdSend state — so a timed-out command is never
  // misreported as 'sent' or 'ack' regardless of what Iridium bookkeeping exists.
  if (command.eventId) {
    const timeoutEvent = timeoutMap.get(String(command.eventId))
    if (timeoutEvent) {
      return withChunkGate(
        {
          ...command,
          via,
          timeout,
          status: 'timeout',
          commsIsoTime: timeoutEvent.isoTime,
          mtmsn: undefined,
          momsn: undefined,
        },
        sbdChunks
      )
    }
  }

  const matchingSbdSend = pickPrimarySbdSend(matchingSbdSends)

  if (!matchingSbdSend) {
    // If the command carries a timeout duration and that window has already
    // elapsed since it was created, treat it as timed out on the client side.
    // This covers commands that were never dispatched (no sbdSend) and for
    // which the backend may never write a timeout note.
    const timeoutMinutes = timeout ? parseInt(timeout, 10) : undefined
    const timeoutMs =
      timeoutMinutes && command.unixTime
        ? command.unixTime + timeoutMinutes * 60 * 1000
        : undefined
    if (timeoutMs && Date.now() > timeoutMs) {
      return withChunkGate(
        {
          ...command,
          via,
          timeout,
          status: 'timeout',
          commsIsoTime: new Date(timeoutMs).toISOString(),
          mtmsn: undefined,
          momsn: undefined,
        },
        sbdChunks
      )
    }
    return withChunkGate(
      {
        ...command,
        via,
        timeout,
        status: 'queued',
        commsIsoTime: command.isoTime,
        mtmsn: undefined,
        momsn: undefined,
      },
      sbdChunks
    )
  }

  // A state of 2 indicates cell comms (direct socket delivery).
  // Pure cell: ACK when sent — an open socket means delivery.
  // cellsat: do NOT ACK on cell alone (#798). Sat may still be delivering
  // remaining SBD chunks; fall through to sat receipt/receive (or 'sent').
  // Multi-part: withChunkGate further blocks ack until all parts are in (#797).
  if (via !== 'cellsat' && (matchingSbdSend.state === 2 || via === undefined)) {
    // Explicitly clear mtmsn/momsn — cell comms do not carry Iridium SBD IDs.
    return withChunkGate(
      {
        ...command,
        via,
        timeout,
        status: 'ack',
        commsIsoTime: matchingSbdSend.isoTime,
        mtmsn: undefined,
        momsn: undefined,
      },
      sbdChunks
    )
  }

  // Find sbdReceipt event by matching sbdSend eventId to part of sbdReceipt name
  const matchingSbdReceipt = matchingSbdSend.eventId
    ? sbdReceiptMap.get(String(matchingSbdSend.eventId))
    : undefined

  // Check for matching sbdReceive with the same mtmsn as the receipt
  if (matchingSbdReceipt && matchingSbdReceipt.mtmsn !== 0) {
    const matchingSbdReceive = matchingSbdReceipt.mtmsn
      ? sbdReceiveMap.get(matchingSbdReceipt.mtmsn)
      : undefined

    // Sat comms are considered ACKed if they have a matching sbdReceive with the same mtmsn as the receipt
    if (matchingSbdReceive) {
      return withChunkGate(
        {
          ...command,
          via,
          timeout,
          status: 'ack',
          commsIsoTime: matchingSbdReceive.isoTime,
          // 0 is a sentinel for "no MTMSN/MOMSN" in TethysDash — normalize to undefined
          mtmsn: matchingSbdReceipt.mtmsn || undefined,
          momsn: matchingSbdReceive.momsn || undefined,
        },
        sbdChunks
      )
    }
  }

  // Same client-side timeout inference for dispatched-but-unacknowledged commands.
  const timeoutMinutes = timeout ? parseInt(timeout, 10) : undefined
  const sentTimeoutMs =
    timeoutMinutes && matchingSbdSend.unixTime
      ? matchingSbdSend.unixTime + timeoutMinutes * 60 * 1000
      : undefined
  if (sentTimeoutMs && Date.now() > sentTimeoutMs) {
    return withChunkGate(
      {
        ...command,
        via,
        timeout,
        status: 'timeout',
        commsIsoTime: new Date(sentTimeoutMs).toISOString(),
        mtmsn: matchingSbdReceipt?.mtmsn || undefined,
        momsn: undefined,
      },
      sbdChunks
    )
  }

  return withChunkGate(
    {
      ...command,
      via,
      timeout,
      status: 'sent',
      commsIsoTime: matchingSbdSend.isoTime,
      mtmsn: matchingSbdReceipt?.mtmsn || undefined,
    },
    sbdChunks
  )
}
