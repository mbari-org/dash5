// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { getDeployments } from '../Deployment/getDeployments'
import { DateTime } from 'luxon'

export interface GetMissionScheduleParams {
  deploymentId: number
}

export interface Mission {
  eventId: number
  vehicleName: string
  eventName: string
  note: string
  user?: string
  isoTime: string
  unixTime: number
  endUnixTime?: number
  endIsoTime?: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  commandType: 'mission' | 'command'
}

export interface GetMissionScheduleResponse {
  result: Mission[]
}

export const getMissionSchedule = async (
  params: GetMissionScheduleParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/missions'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  // Simulating response via parsing other requests for now.
  const deployment = await getDeployments(
    { deploymentId: params.deploymentId },
    { debug, instance, ...config }
  )

  const timePlus = (minutes: number, lengthInMinutes?: number) => {
    const newTime = DateTime.fromMillis(
      deployment[0].startEvent?.unixTime as number
    ).plus({ minutes })
    return {
      isoTime: newTime.toISO(),
      endIsoTime: lengthInMinutes
        ? newTime.plus({ minutes: lengthInMinutes }).toISO()
        : undefined,
      unixTime: newTime.toMillis(),
      endUnixTime: lengthInMinutes
        ? newTime.plus({ minutes: lengthInMinutes }).toMillis()
        : undefined,
    }
  }

  const timeNow = (minutes: number, lengthInMinutes?: number) => {
    const newTime = DateTime.now().plus({ minutes })
    return {
      isoTime: newTime.toISO(),
      endIsoTime: lengthInMinutes
        ? newTime.plus({ minutes: lengthInMinutes }).toISO()
        : undefined,
      unixTime: newTime.toMillis(),
      endUnixTime: lengthInMinutes
        ? newTime.plus({ minutes: lengthInMinutes }).toMillis()
        : undefined,
    }
  }

  const futureEvents: Mission[] = [
    {
      eventName: 'Profile Station',
      note: 'One more time',
      user: 'Reiko Michisaki',
      status: 'running',
      commandType: 'mission',
      eventId: 123,
      vehicleName: deployment[0].vehicle,
      ...timeNow(-5),
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Deeper sample',
      user: 'Reiko Michisaki',
      status: 'pending',
      commandType: 'mission',
      vehicleName: deployment[0].vehicle,
      eventId: 345,
      ...timeNow(45),
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Per YZ shallow sample',
      user: 'Reiko Michisaki',
      status: 'pending',
      commandType: 'mission',
      vehicleName: deployment[0].vehicle,
      eventId: 567,
      ...timeNow(120),
    },
  ]

  const pastEvents: Mission[] = [
    {
      eventName: 'Profile Station',
      note: 'One more time',
      user: 'Reiko Michisaki',
      status: 'completed',
      commandType: 'mission',
      eventId: 123,
      vehicleName: deployment[0].vehicle,
      ...timePlus(-150, 45),
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Deeper sample',
      user: 'Reiko Michisaki',
      status: 'completed',
      commandType: 'mission',
      vehicleName: deployment[0].vehicle,
      eventId: 345,
      ...timePlus(-180, 30),
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Per YZ shallow sample',
      user: 'Reiko Michisaki',
      status: 'cancelled',
      commandType: 'mission',
      vehicleName: deployment[0].vehicle,
      eventId: 567,
      ...timePlus(-185, 5),
    },
  ]

  const placeholderEvents: Mission[] = [
    ...(deployment[0].endEvent?.eventId ? pastEvents : futureEvents),
    {
      eventName: 'resume',
      note: 'fixed it',
      user: 'Reiko Michisaki',
      status: 'completed',
      commandType: 'command',
      vehicleName: deployment[0].vehicle,
      eventId: 3789,
      ...timePlus(-50, 45),
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'per YZ shallow sample',
      user: 'Reiko Michisaki',
      status: 'cancelled',
      commandType: 'mission',
      vehicleName: deployment[0].vehicle,
      eventId: 101112,
      ...timePlus(-80, 45),
    },
  ]

  return placeholderEvents
}
