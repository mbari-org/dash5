import { GetEventsResponse } from '../Event/getEvents'

/** Progress of a multi-SBD command (N of M chunks delivered). */
export interface SbdChunkProgress {
  delivered: number
  total: number
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

/** A chunk is delivered via cell (state 2) or sat (receipt + receive). */
export const isSbdChunkDelivered = (
  sbdSend: GetEventsResponse,
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>
): boolean => {
  if (sbdSend.state === 2) return true
  if (!sbdSend.eventId) return false
  const receipt = sbdReceiptMap.get(String(sbdSend.eventId))
  if (!receipt?.mtmsn) return false
  return sbdReceiveMap.has(receipt.mtmsn)
}

/**
 * Count delivered chunks for a command. Caps at `total` when provided.
 */
export const countDeliveredSbdChunks = (
  sbdSends: GetEventsResponse[],
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>,
  total?: number
): number => {
  const delivered = sbdSends.filter((s) =>
    isSbdChunkDelivered(s, sbdReceiptMap, sbdReceiveMap)
  ).length
  if (total != null) return Math.min(delivered, total)
  return delivered
}

export const buildSbdChunkProgress = (
  commandText: string | undefined | null,
  sbdSends: GetEventsResponse[],
  sbdReceiptMap: Map<string, GetEventsResponse>,
  sbdReceiveMap: Map<number, GetEventsResponse>
): SbdChunkProgress | undefined => {
  const total = parseSbdChunkTotal(commandText)
  if (total == null) return undefined
  return {
    total,
    delivered: countDeliveredSbdChunks(
      sbdSends,
      sbdReceiptMap,
      sbdReceiveMap,
      total
    ),
  }
}
