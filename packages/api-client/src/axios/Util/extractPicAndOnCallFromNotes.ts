import { GetEventsResponse } from '../Event/getEvents'

// Using a more flexible regex pattern to match various formats
const NOTE_REGEX =
  /.*(?:Signing|Signed|Sign) (in|off|out) as (PIC|On-Call|On Call).*/i

/**
 * Extracts PIC and On-Call information from note events
 * @param noteEvents Array of note events
 * @returns Object containing the most recent PIC and On-Call operators
 */
export const extractPicAndOnCallFromNotes = (
  noteEvents: GetEventsResponse[]
): {
  pics: { user: string; unixTime: number }[] | null
  onCalls: { user: string; unixTime: number }[] | null
} => {
  if (noteEvents.length === 0) {
    return { pics: null, onCalls: null }
  }

  // Process note events to determine current PIC and On-Call operators
  const byUser: Record<
    string,
    {
      user: string
      pic: {
        signInUnixTime?: number
        signOffUnixTime?: number
      }
      onCall: {
        signInUnixTime?: number
        signOffUnixTime?: number
      }
    }
  > = {}

  // Sort note events by timestamp for proper processing
  const sortedNoteEvents = [...noteEvents].sort(
    (a, b) => a.unixTime - b.unixTime
  )

  sortedNoteEvents.forEach((event) => {
    // Skip events without a user
    if (!event.user) {
      return
    }

    const user = event.user

    const match = event.note?.match(NOTE_REGEX)

    if (match) {
      const signedIn = match[1].toLowerCase() === 'in'
      const role = match[2].toLowerCase()
      const isPic = role === 'pic'
      const isOnCall = role === 'on-call' || role === 'on call'

      if (!byUser[user]) {
        byUser[user] = {
          user,
          pic: {},
          onCall: {},
        }
      }

      if (isPic) {
        if (signedIn) {
          byUser[user].pic.signInUnixTime = event.unixTime
        } else {
          byUser[user].pic.signOffUnixTime = event.unixTime
        }
      } else if (isOnCall) {
        if (signedIn) {
          byUser[user].onCall.signInUnixTime = event.unixTime
        } else {
          byUser[user].onCall.signOffUnixTime = event.unixTime
        }
      }
    }
  })

  // Find all current PIC and On-Call operators
  const currentPilots: { user: string; unixTime: number }[] = []
  const currentOnCall: { user: string; unixTime: number }[] = []

  Object.entries(byUser).forEach(([user, info]) => {
    // Check for PIC
    if (
      info.pic.signInUnixTime &&
      (!info.pic.signOffUnixTime ||
        info.pic.signOffUnixTime < info.pic.signInUnixTime)
    ) {
      currentPilots.push({
        user,
        unixTime: info.pic.signInUnixTime,
      })
    }

    // Check for On-Call
    if (
      info.onCall.signInUnixTime &&
      (!info.onCall.signOffUnixTime ||
        info.onCall.signOffUnixTime < info.onCall.signInUnixTime)
    ) {
      currentOnCall.push({
        user,
        unixTime: info.onCall.signInUnixTime,
      })
    }
  })

  // Sort by most recent first (descending order)
  currentPilots.sort((a, b) => b.unixTime - a.unixTime)
  currentOnCall.sort((a, b) => b.unixTime - a.unixTime)

  // Return the most recent PIC and On-Call operators
  return {
    pics: currentPilots ?? null,
    onCalls: currentOnCall ?? null,
  }
}
