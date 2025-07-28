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
export const makeCommand = ({
  commandText,
  scheduleMethod = 'end',
  specifiedLocalTime,
  units,
  isMission = false,
}: {
  commandText: string
  scheduleMethod?: ScheduleMethod
  specifiedLocalTime?: string | null
  units?: { name: string; abbreviation: string }[]
  isMission?: boolean
}) => {
  // Convert any full unit names in the provided command text to their abbreviations
  const resolvedCommandText = units
    ? abbreviateUnitsInCommand(commandText, units)
    : commandText

  const previewCommandText = isMission
    ? `${resolvedCommandText}; run`
    : resolvedCommandText

  switch (scheduleMethod) {
    case 'ASAP':
      return {
        commandText: resolvedCommandText,
        schedDate: 'asap',
        previewSbd: `sched asap "${previewCommandText}"`,
      }
    case 'time':
      if (!specifiedLocalTime) {
        return {
          commandText: resolvedCommandText,
          schedDate: '',
          previewSbd: `sched "${previewCommandText}"`,
        }
      }
      const t = DateTime.fromISO(specifiedLocalTime).toUTC()
      const schedDate = `${t.toFormat('yyyyMMdd')}}T${t.toFormat('HHmm')}`
      return {
        commandText: resolvedCommandText,
        schedDate,
        previewSbd: `sched ${schedDate} "${previewCommandText}"`,
      }
    default:
      return {
        commandText: resolvedCommandText,
        schedDate: '',
        previewSbd: `sched "${previewCommandText}"`,
      }
  }
}

// Accepts a local time string and returns a formatted UTC time string
export const makeMissionCommand = ({
  mission,
  parameterOverrides,
  scheduleMethod,
  specifiedLocalTime,
  units,
}: {
  parameterOverrides: ParameterProps[]
  mission: string
  scheduleMethod: ScheduleMethod
  specifiedLocalTime?: string
  units?: { name: string; abbreviation: string }[]
}) => {
  const missionName = mission.split('/').pop()?.split('.')[0]
  const commands: string[] = [`load ${mission}`]
  parameterOverrides.forEach((p) => {
    commands.push(
      `set ${missionName}${p.insert ? `:${p.insert}` : ''}.${
        p.name
      } ${printUnit(p)}`
    )
  })
  return makeCommand({
    commandText: commands.join(';'),
    scheduleMethod,
    specifiedLocalTime,
    units,
    isMission: true,
  })
}
