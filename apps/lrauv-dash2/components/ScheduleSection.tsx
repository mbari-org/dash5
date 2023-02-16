import React, { useState, useRef } from 'react'
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
import { useDeploymentCommandStatus } from '@mbari/api-client'
import { capitalize } from '@mbari/utils'
import useGlobalModalId from '../lib/useGlobalModalId'
import { toast } from 'react-hot-toast'

export interface ScheduleSectionProps {
  className?: string
  style?: React.CSSProperties
  authenticated?: boolean
  vehicleName: string
  currentDeploymentId?: number
  activeDeployment?: boolean
}

export const parseMissionCommand = (name: string) => {
  const info = name
    .split(' ')
    .filter((s) => !['run', 'sched', 'asap'].includes(s))
    .join(' ')
    .split(';')
  return {
    name: info[0],
    parameters: info[1],
  }
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDeploymentId,
  activeDeployment,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const [scheduleFilter, setScheduleFilter] = useState<string>('')
  const [scheduleSearch, setScheduleSearch] = useState<string>('')

  const { data: deploymentCommands } = useDeploymentCommandStatus(
    {
      deploymentId: currentDeploymentId ?? 0,
    },
    {
      enabled: !!currentDeploymentId,
    }
  )

  const vehicleName = deploymentCommands?.deploymentInfo?.vehicleName ?? '...'

  const toggleSchedule = () => {
    setGlobalModalId({
      id: 'newCommand',
      meta: {
        command: scheduleStatus === 'paused' ? 'sched resume' : 'sched pause',
      },
    })
  }

  const missions = deploymentCommands?.commandStatuses

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
        `${v.event.data}${v.event.note}${v.event.user}`
          .toLowerCase()
          .includes(scheduleSearch.toLowerCase())
    )

  const results = [scheduledCells, historicCells].flat()
  const totalCellCount =
    results.length + staticFilterCellOffset + staticHeaderCellOffset

  const menuRef = useRef<HTMLDivElement | null>(null)
  const [currentMoreMenu, setCurrentMoreMenu] = useState<{
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

  const scheduleStatus: ScheduleCellProps['scheduleStatus'] | null =
    missions?.[0]?.event?.data === 'sched pause' ? 'paused' : 'running'

  const cellAtIndex = (index: number) => {
    if (index === 0 && activeDeployment) {
      return (
        <div className="flex border-b border-stone-200 py-2 px-4 text-sm">
          <p className="flex-grow text-xs">
            {capitalize(vehicleName)} is scheduled until
            <br /> TBD
          </p>
          <AccessoryButton
            label="Mission"
            icon={faPlus}
            className="mx-2"
            onClick={() => {
              setGlobalModalId({ id: 'newMission' })
            }}
            tight
          />
          <AccessoryButton
            label="Command"
            icon={faPlus}
            tight
            onClick={() => {
              setGlobalModalId({ id: 'newCommand' })
            }}
          />
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
    const { name: missionName, parameters: missionParams } =
      parseMissionCommand(mission?.event.data ?? '')
    console.log(missionName, missionParams)
    return mission ? (
      <ScheduleCell
        label={missionName ?? 'Unknown'}
        secondary={missionParams ?? 'No parameters'}
        status={mission.status === 'TBD' ? 'completed' : 'pending'}
        name={mission.event.user ?? 'Unknown'}
        scheduleStatus={
          (['pending', 'running'].includes(mission.status) && scheduleStatus) ||
          undefined
        }
        className="border-b border-stone-200"
        description={
          mission?.event.unixTime
            ? `Ended ${DateTime.fromMillis(
                mission.event.unixTime ?? 0
              ).toFormat('h:mm')}`
            : `Started ${DateTime.fromMillis(
                mission.event.unixTime ?? 0
              ).toFormat('h:mm')}`
        }
        description2={
          DateTime.fromMillis(mission.event.unixTime ?? 0).toRelative() ?? ''
        }
        onSelect={() => undefined}
        onMoreClick={openMoreMenu}
        eventId={mission.event.eventId}
        commandType={
          mission?.event?.eventType === 'run' ? 'mission' : 'command'
        }
      />
    ) : (
      <p className="mx-2 my-2 rounded bg-stone-100 p-2">No Data</p>
    )
  }

  const handleDuplicate = ({
    eventId,
  }: {
    eventId: number
    commandType: string
  }) => {
    const event = results.find((r) => r?.event.eventId === eventId)?.event
    const mission = parseMissionCommand(event?.data ?? '')
    setGlobalModalId({
      id: 'newCommand',
      meta: {
        command: event?.text ?? event?.data ?? '',
        mission: mission.name,
        params: mission.parameters,
      },
    })
  }

  const handleDelete = (_: { eventId: number; commandType: string }) => {
    toast.error('This feature is currently not supported.')
  }

  const handleDownload = ({
    eventId,
    commandType,
  }: {
    eventId: number
    commandType: string
  }) => {
    toast.success(`Saved ${commandType}-${eventId}.txt`)
    const event = results.find((r) => r?.event.eventId === eventId)?.event
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(event?.data ?? '')
    )
    element.setAttribute('download', `${commandType}-${eventId}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    element.remove()
  }

  const handleMoveInQueue = ({
    eventId,
    commandType,
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
            className="min-w-[240px]"
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
