import { ParameterProps, ScheduleOption } from '@mbari/react-ui'
import { DateTime } from 'luxon'

// export type ScheduleOption = 'ASAP' | 'end' | 'time'

const printUnit = (p: ParameterProps) => {
  if (p.overrideValue?.match(/true/i)) {
    return '1 bool'
  }
  if (p.overrideValue?.match(/false/i)) {
    return '0 bool'
  }
  return `${p.overrideValue} ${p.overrideUnit ?? p.unit}`
}

export const makeCommand = ({
  commandText,
  scheduleMethod = 'end',
  specifiedTime,
}: {
  commandText: string
  scheduleMethod?: ScheduleOption
  specifiedTime?: string | null
}) => {
  switch (scheduleMethod) {
    case 'ASAP':
      return {
        commandText,
        schedDate: 'asap',
        previewSbd: `sched asap "${commandText}"`,
      }
    case 'time':
      if (!specifiedTime) {
        return {
          commandText,
          schedDate: '',
          previewSbd: `sched "${commandText}"`,
        }
      }
      const t = DateTime.fromISO(specifiedTime)
      const schedDate = `${t.toFormat('yyyyMMdd')}}T${t.toFormat('HHmm')}`
      return {
        commandText,
        schedDate,
        previewSbd: `sched ${schedDate} "${commandText}"`,
      }
    default:
      return {
        commandText,
        schedDate: '',
        previewSbd: `sched "${commandText}"`,
      }
  }
}

export const makeMissionCommand = ({
  mission,
  parameterOverrides,
  scheduleMethod,
  specifiedTime,
}: {
  parameterOverrides: ParameterProps[]
  mission: string
  scheduleMethod: ScheduleOption
  specifiedTime?: string
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
  commands.push('run')
  return makeCommand({
    commandText: commands.join('; '),
    scheduleMethod,
    specifiedTime,
  })
}
