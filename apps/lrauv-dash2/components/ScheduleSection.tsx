import React from 'react'
import { useMissionSchedule } from '@mbari/api-client'
import { AccessoryButton, AccordionCells, ScheduleCell } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
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
    if (index === 0) {
      return (
        <div className="flex py-2 px-4 text-sm">
          <p className="flex-grow text-xs">
            Brizo is scheduled until
            <br /> tomorrow at ~06:30
          </p>
          <AccessoryButton label="Mission" icon={faPlus} className="mx-2" />
          <AccessoryButton label="Command" icon={faPlus} />
        </div>
      )
    }
    const mission = missions?.[index - 1]
    return mission ? (
      <ScheduleCell
        label={mission.eventName}
        secondary={mission.note}
        status={mission.status}
        name={mission.user}
        className="border-b border-gray-200"
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
