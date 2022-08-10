import React from 'react'
import { useMissionSchedule } from '@mbari/api-client'
import { AccordionCells, ScheduleCell } from '@mbari/react-ui'
import { DateTime } from 'luxon'

export interface ScheduleSectionProps {
  className?: string
  style?: React.CSSProperties
  authenticated?: boolean
  vehicleName: string
  currentDeploymentId?: number
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDeploymentId,
}) => {
  const { data: missions } = useMissionSchedule({
    deploymentId: currentDeploymentId,
  })
  const cellAtIndex = (index: number) => {
    const mission = missions?.[index]
    return mission ? (
      <ScheduleCell
        label={mission.eventName}
        secondary={mission.note}
        status={mission.status}
        name={mission.user}
        description={
          mission?.endUnixTime
            ? `Ended ${DateTime.fromMillis(mission.endUnixTime).toFormat(
                'h:mm'
              )}`
            : `Started ${DateTime.fromMillis(mission.unixTime).toFormat(
                'h:mm'
              )}`
        }
        description2={
          DateTime.fromMillis(
            mission.endUnixTime ?? mission.unixTime
          ).toRelative() ?? ''
        }
        onSelect={() => undefined}
        onSelectMore={() => undefined}
      />
    ) : (
      <p>No Data</p>
    )
  }

  return (
    <>
      <AccordionCells cellAtIndex={cellAtIndex} count={missions?.length} />
    </>
  )
}

ScheduleSection.displayName = 'components.ScheduleSection'
