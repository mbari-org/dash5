export interface BadBatteryFaultEvent {
  name?: string
  text?: string
  unixTime: number
}

export interface BadBatteryFault {
  show: boolean
  text: string
}

const STICK_COUNT = /from (\d+) sticks/i

const isBpc1 = (event: BadBatteryFaultEvent) =>
  event.name === 'BPC1' || /\bBPC1\b/.test(event.text ?? '')

/**
 * Mirrors auvstatus parseFaults() BPC1 handling: a Battery-stick or
 * "Failed to receive data from N sticks" fault turns on the Dash4 BAD BATT overlay.
 */
export const parseBadBatteryFault = (
  events: BadBatteryFaultEvent[]
): BadBatteryFault => {
  let badBattery = 0
  let text = ''

  const newestFirst = [...events].sort((a, b) => b.unixTime - a.unixTime)

  for (const event of newestFirst) {
    if (!isBpc1(event)) continue
    const rt = event.text ?? 'NA'

    if (rt.startsWith('Battery stick') && !(badBattery > 100)) {
      badBattery = event.unixTime
    }

    if (rt.startsWith('Failed to receive data') && !text) {
      if (!(badBattery > 100)) badBattery = event.unixTime
      const match = rt.match(STICK_COUNT)
      if (match) text = `${match[1]}x`
    }
  }

  return { show: badBattery > 100, text }
}
