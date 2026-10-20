import { ParameterProps, ScheduleMethod } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { abbreviateUnitsInCommand } from '@mbari/utils'

const printUnit = (p: ParameterProps) => {
  if (p.overrideValue?.match(/true/i)) {
    return '1 bool'
  }
  if (p.overrideValue?.match(/false/i)) {
    return '0 bool'
  }
  return `${p.overrideValue} ${p.overrideUnit ?? p.unit}`
}

// Accepts a local time string and returns a formatted UTC time string
const SCHEDULE_REPEAT_MIN = 2
const SCHEDULE_REPEAT_MAX = 30

/** Repeat count the backend will accept with a dated schedDate. */
export const schedRepeatForApi = (
  scheduleMethod: ScheduleMethod | undefined,
  schedRepeat?: number
): number | undefined =>
  scheduleMethod === 'time' &&
  typeof schedRepeat === 'number' &&
  Number.isInteger(schedRepeat) &&
  schedRepeat >= SCHEDULE_REPEAT_MIN &&
  schedRepeat <= SCHEDULE_REPEAT_MAX
    ? schedRepeat
    : undefined

export const makeCommand = ({
  commandText,
  scheduleMethod = 'end',
  specifiedLocalTime,
  schedRepeat,
  units,
}: {
  commandText: string
  scheduleMethod?: ScheduleMethod
  specifiedLocalTime?: string | null
  /** Total days, including the first. Ignored unless scheduling at a specific time. */
  schedRepeat?: number
  units?: { name: string; abbreviation: string }[]
}): {
  commandText: string
  schedDate: string
  previewSbd: string
  schedRepeat?: number
} => {
  // Convert any full unit names in the provided command text to their abbreviations
  const resolvedCommandText = units
    ? abbreviateUnitsInCommand(commandText, units)
    : commandText

  const repeat = schedRepeatForApi(scheduleMethod, schedRepeat)

  switch (scheduleMethod) {
    case 'ASAP':
      return {
        commandText: resolvedCommandText,
        schedDate: 'asap',
        previewSbd: `sched asap "${resolvedCommandText}"`,
      }
    case 'time':
      if (!specifiedLocalTime) {
        return {
          commandText: resolvedCommandText,
          schedDate: '',
          previewSbd: `sched "${resolvedCommandText}"`,
        }
      }
      const t = DateTime.fromISO(specifiedLocalTime).toUTC()
      const schedDate = `${t.toFormat('yyyyMMdd')}T${t.toFormat('HHmm')}`
      return {
        commandText: resolvedCommandText,
        schedDate,
        schedRepeat: repeat,
        previewSbd: repeat
          ? `sched repeat ${repeat} ${schedDate} "${resolvedCommandText}"`
          : `sched ${schedDate} "${resolvedCommandText}"`,
      }
    default:
      return {
        commandText: resolvedCommandText,
        schedDate: '',
        previewSbd: `sched "${resolvedCommandText}"`,
      }
  }
}

// Builds a `load …; set …; run` mission command string.
// `mission` is the file path for `load`. `missionId` is the script's mission
// ID from GET /commands/script (used for `set`); falls back to the filename
// stem when omitted (e.g. path and ID match).
export const makeMissionCommand = ({
  mission,
  missionId,
  parameterOverrides,
  scheduleMethod,
  specifiedLocalTime,
  schedRepeat,
  units,
}: {
  parameterOverrides: ParameterProps[]
  mission: string
  /** Script mission ID for `set` (may differ from the .tl filename). */
  missionId?: string
  scheduleMethod: ScheduleMethod
  specifiedLocalTime?: string
  schedRepeat?: number
  units?: { name: string; abbreviation: string }[]
}) => {
  const missionName =
    missionId?.trim() || mission.split('/').pop()?.split('.')[0]
  const commands: string[] = [`load ${mission}`]
  parameterOverrides.forEach((p) => {
    commands.push(
      `set ${missionName}${p.insert ? `:${p.insert}` : ''}.${
        p.name
      } ${printUnit(p)}`
    )
  })
  commands.push('run')
  return makeCommand({
    commandText: commands.join(';'),
    scheduleMethod,
    specifiedLocalTime,
    schedRepeat,
    units,
  })
}
