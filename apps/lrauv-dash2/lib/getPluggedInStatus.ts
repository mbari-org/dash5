import { DateTime } from 'luxon'
import type { DeploymentEvent } from '@mbari/api-client'

/**
 * Docked / not on mission comms logic aligned with the deployment page.
 * - `recoverEvent`: vehicle has a recovery event on the deployment (back at dock).
 * - Future `startEventUnix`: deployment exists but mission hasn’t started yet
 *   (ballast & trim, pre-launch), so treat as still “plugged in” operationally.
 */
export const getPluggedInStatus = (args: {
  recoverEvent?: DeploymentEvent
  startEventUnix?: number | null
}): boolean =>
  Boolean(
    args.recoverEvent ||
      (args.startEventUnix &&
        DateTime.fromMillis(args.startEventUnix).toMillis() >
          DateTime.now().toMillis())
  )
