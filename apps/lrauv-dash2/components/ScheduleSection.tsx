import React, { useState, useRef } from 'react'
import { useMissionSchedule } from '@mbari/api-client'
import {
  AccessoryButton,
  AccordionCells,
  ScheduleCell,
  ScheduleCellProps,
  ScheduleCellBackgrounds,
  Input,
  Dropdown,
  ScheduleCellStatus,
} from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import clsx from 'clsx'
import { Select } from '@mbari/react-ui/dist/Fields/Select'

export interface ScheduleSectionProps {
  className?: string
  style?: React.CSSProperties
  authenticated?: boolean
  vehicleName: string
  currentDeploymentId?: number
  activeDeployment?: boolean
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDeploymentId,
  activeDeployment,
}) => {
  const [scheduleStatus, setScheduleStatus] =
    useState<ScheduleCellProps['scheduleStatus'] | null>('running')
  const [scheduleFilter, setScheduleFilter] = useState<string>('')
  const [scheduleSearch, setScheduleSearch] = useState<string>('')

  const { data: missions } = useMissionSchedule(
    {
      deploymentId: currentDeploymentId ?? 0,
    },
    {
      enabled: !!currentDeploymentId,
    }
  )

  const toggleSchedule = () =>
    setScheduleStatus(scheduleStatus === 'paused' ? 'running' : 'paused')

  const scheduledTypes = ['pending', 'running']
  const staticHeaderCellOffset = activeDeployment ? 2 : 0
  const indexOfPastSchedule =
    (missions?.findIndex((v) => !scheduledTypes.includes(v.status)) ?? 0) +
    staticHeaderCellOffset
  const hasPastSchedule = indexOfPastSchedule > -1
  const staticFilterCellOffset = hasPastSchedule ? 1 : 0

  const handleScheduleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleSearch(e.target.value)
  }

  const scheduledCells = missions?.filter((v) =>
    scheduledTypes.includes(v.status)
  )
  const historicCells = missions
    ?.filter((v) => !scheduledTypes.includes(v.status))
    .filter(
      (v) =>
        !scheduleFilter ||
        scheduleFilter === 'all' ||
        v.status === scheduleFilter
    )
    .filter(
      (v) =>
        !scheduleSearch ||
        scheduleSearch.length < 1 ||
        `${v.eventName}${v.note}${v.user}`
          .toLowerCase()
          .includes(scheduleSearch.toLowerCase())
    )

  const results = [scheduledCells, historicCells].flat()
  const totalCellCount =
    results.length + staticFilterCellOffset + staticHeaderCellOffset

  const menuRef = useRef<HTMLDivElement | null>(null)
  const [currentMoreMenu, setCurrentMoreMenu] =
    useState<{
      eventId?: number
      commandType: 'mission' | 'command'
      status: ScheduleCellStatus
      rect: DOMRect
    } | null>(null)
  const closeMoreMenu = () => setCurrentMoreMenu(null)
  const openMoreMenu: ScheduleCellProps['onMoreClick'] = (
    target,
    rect?: DOMRect
  ) => {
    if (rect) {
      setCurrentMoreMenu({ ...target, rect })
    }
  }

  const cellAtIndex = (index: number) => {
    if (index === 0 && activeDeployment) {
      return (
        <div className="flex border-b border-stone-200 py-2 px-4 text-sm">
          <p className="flex-grow text-xs">
            Brizo is scheduled until
            <br /> tomorrow at ~06:30
          </p>
          <AccessoryButton
            label="Mission"
            icon={faPlus}
            className="mx-2"
            tight
          />
          <AccessoryButton label="Command" icon={faPlus} tight />
        </div>
      )
    }
    if (index === 1 && activeDeployment) {
      return (
        <div
          className={clsx(
            'flex px-4 py-2 text-sm',
            scheduleStatus === 'running'
              ? ScheduleCellBackgrounds.running
              : ScheduleCellBackgrounds.paused
          )}
        >
          <span className="my-auto mr-2 text-xs font-bold">
            Schedule is running
          </span>
          <AccessoryButton
            label={scheduleStatus === 'running' ? 'Stop All' : 'Resume All'}
            className="my-auto"
            onClick={toggleSchedule}
            tight
          />
        </div>
      )
    }
    if (index === indexOfPastSchedule && hasPastSchedule) {
      return (
        <div className="grid grid-cols-3 gap-2 px-4 py-2">
          <span className="my-auto text-xs font-bold">Schedule History</span>
          <Select
            name="scheduleFilters"
            options={[
              { name: 'All', id: 'all' },
              { name: 'Completed', id: 'completed' },
              { name: 'Cancelled', id: 'cancelled' },
            ]}
            value={scheduleFilter}
            placeholder="Filter"
            onSelect={(id) => setScheduleFilter(id ?? 'all')}
          />
          <Input
            name="search"
            placeholder="Search"
            value={scheduleSearch}
            onChange={handleScheduleSearch}
          />
        </div>
      )
    }
    const indexOffset =
      index < (indexOfPastSchedule ?? results?.length ?? 0)
        ? -staticHeaderCellOffset
        : -staticHeaderCellOffset - staticFilterCellOffset
    const mission = results[index + indexOffset]
    return mission ? (
      <ScheduleCell
        label={mission.eventName}
        secondary={mission.note}
        status={
          (mission.status === 'running' ? scheduleStatus : mission.status) ??
          'pending'
        }
        name={mission.user ?? 'Unknown'}
        scheduleStatus={
          (['pending', 'running'].includes(mission.status) && scheduleStatus) ||
          undefined
        }
        className="border-b border-stone-200"
        description={
          mission?.endUnixTime
            ? `Ended ${DateTime.fromMillis(mission.endUnixTime ?? 0).toFormat(
                'h:mm'
              )}`
            : `Started ${DateTime.fromMillis(mission.unixTime ?? 0).toFormat(
                'h:mm'
              )}`
        }
        description2={
          DateTime.fromMillis(
            mission.endUnixTime ?? mission.unixTime ?? 0
          ).toRelative() ?? ''
        }
        onSelect={() => undefined}
        onMoreClick={openMoreMenu}
        eventId={mission.eventId}
        commandType={mission.commandType}
      />
    ) : (
      <p>No Data</p>
    )
  }

  const handleDuplicate = ({
    eventId,
    commandType,
  }: {
    eventId: number
    commandType: string
  }) => {
    console.log('should duplicate:', eventId, commandType)
  }

  const handleDelete = ({
    eventId,
    commandType,
  }: {
    eventId: number
    commandType: string
  }) => {
    console.log('should delete:', eventId, commandType)
  }

  const handleDownload = ({
    eventId,
    commandType,
  }: {
    eventId: number
    commandType: string
  }) => {
    console.log('should download:', eventId, commandType)
  }

  const handleMoveInQueue = ({
    eventId,
    commandType,
    direction,
  }: {
    eventId: number
    commandType: string
    direction: 'up' | 'down'
  }) => {
    console.log('should move in queue:', eventId, commandType)
  }

  return (
    <>
      <AccordionCells cellAtIndex={cellAtIndex} count={totalCellCount} />
      {currentMoreMenu && (
        <div
          className="fixed mr-2 mb-2 min-w-[140px] whitespace-nowrap"
          ref={menuRef}
          style={{
            top:
              (currentMoreMenu?.rect?.top ?? 0) -
              (menuRef.current?.offsetHeight ?? 0),
            right:
              typeof window !== 'undefined'
                ? window.innerWidth - (currentMoreMenu?.rect?.right ?? 0)
                : 0,
            zIndex: 1001,
          }}
        >
          <Dropdown
            onDismiss={closeMoreMenu}
            options={[
              {
                label: `Use for new ${currentMoreMenu.commandType}`,
                onSelect: () => {
                  handleDuplicate({
                    eventId: currentMoreMenu?.eventId as number,
                    commandType: currentMoreMenu?.commandType as string,
                  })
                  closeMoreMenu()
                },
              },
              {
                label: 'Delete from Queue',
                onSelect: () => {
                  handleDelete({
                    eventId: currentMoreMenu?.eventId as number,
                    commandType: currentMoreMenu?.commandType as string,
                  })
                  closeMoreMenu()
                },
              },
              {
                label: 'Download SBDs',
                onSelect: () => {
                  handleDownload({
                    eventId: currentMoreMenu?.eventId as number,
                    commandType: currentMoreMenu?.commandType as string,
                  })
                  closeMoreMenu()
                },
              },
              ...[
                {
                  label: 'Move Up',
                  onSelect: () => {
                    handleMoveInQueue({
                      eventId: currentMoreMenu?.eventId as number,
                      commandType: currentMoreMenu?.commandType as string,
                      direction: 'up',
                    })
                    closeMoreMenu()
                  },
                },
                {
                  label: 'Move Down',
                  onSelect: () => {
                    handleMoveInQueue({
                      eventId: currentMoreMenu?.eventId as number,
                      commandType: currentMoreMenu?.commandType as string,
                      direction: 'down',
                    })
                    closeMoreMenu()
                  },
                },
              ].filter(() =>
                ['running', 'pending'].includes(currentMoreMenu.status)
              ),
            ]}
          />
        </div>
      )}
    </>
  )
}

ScheduleSection.displayName = 'components.ScheduleSection'
