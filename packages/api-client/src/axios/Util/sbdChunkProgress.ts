import { GetEventsResponse } from '../Event/getEvents'

/** Progress of a multi-SBD command (N of M chunks delivered / in flight). */
export interface SbdChunkProgress {
  delivered: number
  /** Shore has dispatched these parts; vehicle has not confirmed yet. */
  inTransit: number
  total: number
}

export interface SbdChunkDeliveredOptions {
  /**
   * When true, cell sbdSend state:2 counts as delivered (pure cell success).
   * Never use for cellsat — state:2 is shore dispatch, not vehicle receipt.
   * Never use when the command has timed out.
   */
  countCellState2?: boolean
  /**
   * When true, undelivered sends stay pending (gray) — no orange in-transit.
   * Use on timeout so partial greens freeze and the rest stay empty.
   */
  freezeInTransit?: boolean
}

/**
 * Parse total SBD part count from Mission Request / scheduled command text.
 * Chunks are tagged like `38kk8 1 3` … `38kk8 3 3` (part total).
 * Returns undefined when not multi-part (missing or total <= 1).
 */
export const parseSbdChunkTotal = (
  commandText?: string | null
): number | undefined => {
  if (!commandText) return undefined
  // Match "<token> <part> <total>" near end of a chunk / line
  const re = /\b\S+\s+(\d+)\s+(\d+)\b/g
  let total = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(commandText)) !== null) {
    const part = parseInt(match[1], 10)
    const t = parseInt(match[2], 10)
    if (t >= 2 && part >= 1 && part <= t) {
      total = Math.max(total, t)
    }
  }
  return total >= 2 ? total : undefined
}

/**
 * Vehicle-side delivery only: sat receipt+receive.
 * Optional cell state:2 for pure-cell success (not cellsat, not timed-out).
 */
export const isSbdChunkDelivered = (
  sbdSend: GetEventsResponse,
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  options?: SbdChunkDeliveredOptions
): boolean => {
  if (sbdSend.eventId) {
    const receipt = sbdReceiptMap.get(String(sbdSend.eventId))
    if (receipt?.mtmsn && sbdReceiveMap.has(receipt.mtmsn)) {
      return true
    }
  }
  // state:2 = dispatched on cell socket — not proof the vehicle has the chunk
  // (cellsat/timeout can still fail after this).
  return Boolean(options?.countCellState2 && sbdSend.state === 2)
}

/** Shore has an sbdSend for this part, but vehicle has not confirmed delivery. */
export const isSbdChunkInTransit = (
  sbdSend: GetEventsResponse,
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  options?: SbdChunkDeliveredOptions
): boolean => {
  if (options?.freezeInTransit) return false
  return !isSbdChunkDelivered(sbdSend, sbdReceiptMap, sbdReceiveMap, options)
}

/**
 * Count delivered chunks for a command. Caps at `total` when provided.
 */
export const countDeliveredSbdChunks = (
  sbdSends: GetEventsResponse[],
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  total?: number,
  options?: SbdChunkDeliveredOptions
): number => {
  const delivered = sbdSends.filter((s) =>
    isSbdChunkDelivered(s, sbdReceiptMap, sbdReceiveMap, options)
  ).length
  if (total != null) return Math.min(delivered, total)
  return delivered
}

export const countInTransitSbdChunks = (
  sbdSends: GetEventsResponse[],
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  total?: number,
  options?: SbdChunkDeliveredOptions
): number => {
  if (options?.freezeInTransit) return 0
  const inTransit = sbdSends.filter((s) =>
    isSbdChunkInTransit(s, sbdReceiptMap, sbdReceiveMap, options)
  ).length
  if (total != null) {
    const delivered = countDeliveredSbdChunks(
      sbdSends,
      sbdReceiptMap,
      sbdReceiveMap,
      total,
      options
    )
    return Math.min(inTransit, Math.max(0, total - delivered))
  }
  return inTransit
}

export const buildSbdChunkProgress = (
  commandText: string | undefined | null,
  sbdSends: GetEventsResponse[],
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  options?: SbdChunkDeliveredOptions
): SbdChunkProgress | undefined => {
  const total = parseSbdChunkTotal(commandText)
  if (total == null) return undefined
  const delivered = countDeliveredSbdChunks(
    sbdSends,
    sbdReceiptMap,
    sbdReceiveMap,
    total,
    options
  )
  const inTransit = countInTransitSbdChunks(
    sbdSends,
    sbdReceiptMap,
    sbdReceiveMap,
    total,
    options
  )
  return { total, delivered, inTransit }
}
