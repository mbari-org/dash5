// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { getDeployments } from '../Deployment/getDeployments'
import { getEvents } from '../Event/getEvents'
import { DateTime } from 'luxon'

export interface GetMissionsParams {
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
  endUnixTime?: string
  endIsoTime?: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  commandType: 'mission' | 'command'
}

export interface GetMissionsResponse {
  result: Mission[]
}

export const getMissions = async (
  params: GetMissionsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/missions'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  // const response = await instance.get(
  //   `${url}?${new URLSearchParams({ ...params })}`,
  //   config
  // )
  // return response.data as GetMissionsResponse

  // Simulating response via parsing other requests for now.
  const deployment = await getDeployments(
    { deploymentId: params.deploymentId },
    { debug, instance, ...config }
  )
  const events = await getEvents(
    {
      vehicles: [deployment[0].vehicle],
      from: DateTime.fromMillis(
        deployment[0].startEvent?.unixTime as number
      ).toISO(),
      to: deployment[0].lastEvent
        ? DateTime.fromMillis(deployment[0].lastEvent).toISO()
        : DateTime.now().toISO(),
    },
    { debug, instance, ...config }
  )

  const placeholderEvents = [
    {
      eventName: 'Profile Station',
      note: 'One more time',
      user: 'Reiko Michisaki',
      status: 'running',
      type: 'mission',
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Deeper sample',
      user: 'Reiko Michisaki',
      status: 'pending',
      type: 'mission',
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'Per YZ shallow sample',
      user: 'Reiko Michisaki',
      status: 'pending',
      type: 'mission',
    },
    {
      eventName: 'resume',
      note: 'fixed it',
      user: 'Reiko Michisaki',
      status: 'completed',
      type: 'command',
    },
    {
      eventName: 'ESP Sample at depth',
      note: 'per YZ shallow sample',
      user: 'Reiko Michisaki',
      status: 'cancelled',
      type: 'mission',
    },
  ]

  return events.slice(0, placeholderEvents.length).map((e, i) => ({
    ...placeholderEvents[i],
    eventId: e.eventId,
    vehicleName: e.vehicleName,
    isoTime: e.isoTime,
    unixTime: e.unixTime,
    endUnixTime: events[i + 1]?.unixTime,
    endIsoTime: events[i + 1]?.isoTime,
  }))
}
