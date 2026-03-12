import React, { useState, useRef, useMemo } from 'react'
import {
  AccessoryButton,
  AccordionCells,
  ScheduleCell,
  ScheduleCellProps,
  ScheduleCellBackgrounds,
  Input,
  Dropdown,
  ScheduleCellStatus,
  LogsToolbar,
  LoadMoreButton,
} from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { Select } from '@mbari/react-ui/dist/Fields/Select'
import {
  EventType,
  GetEventsResponse,
  useDeploymentCommandStatus,
  useInfiniteEvents,
  useMissionStartedEvent,
} from '@mbari/api-client'
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

export interface CommandStatusItem {
  event: {
    data?: string
    note?: string
    user?: string
    unixTime?: number
    eventId: number
    eventType: string
    text?: string
  }
  status: string
}

const VALID_SCHEDULE_CELL_STATUSES: ScheduleCellStatus[] = [
  'pending',
  'running',
  'cancelled',
  'completed',
  'paused',
]

const toScheduleCellStatus = (status: string): ScheduleCellStatus =>
  VALID_SCHEDULE_CELL_STATUSES.includes(status as ScheduleCellStatus)
    ? (status as ScheduleCellStatus)
    : 'completed'

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

/**
 * Detects if a command is actually a mission command by checking if it contains
 * "load" followed by a mission file path and "run"
 */
export const isMissionCommand = (
  commandData?: string,
  commandText?: string
): boolean => {
  const text = commandText || commandData || ''
  // Check if it contains "load" followed by a mission file (.xml or .tl) and "run"
  const hasLoad = /\bload\s+[A-Za-z0-9_/]+\.(?:xml|tl)/i.test(text)
  const hasRun = /\brun\b/i.test(text)
  return hasLoad && hasRun
}

/**
 * Extracts the bare mission name from a mission-started text field.
 * e.g. "Started mission circle_acoustic_contact" → "circle_acoustic_contact"
 */
export const missionNameFromStartedText = (text: string): string =>
  text.replace(/^Started mission\s+/i, '').trim()

/**
 * Extracts the bare mission name from a run/command event data string.
 * e.g. "load Science/circle_acoustic_contact.tl;set ...;run" → "circle_acoustic_contact"
 */
export const missionNameFromEventData = (data?: string): string => {
  const match = data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/i)
  if (!match) return ''
  const filename = match[0].split('/').pop() ?? ''
  return filename.replace(/\.(xml|tl)$/i, '')
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDeploymentId,
  activeDeployment,
  vehicleName,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const [scheduleFilter, setScheduleFilter] = useState<string>('')
  const [scheduleSearch, setScheduleSearch] = useState<string>('')
  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(false)
  const toggleDeploymentLogsOnly = () => {
    setDeploymentLogsOnly((prev) => !prev)
  }

  const deploymentResponse = useDeploymentCommandStatus(
    {
      deploymentId: currentDeploymentId ?? 0,
    },
    {
      enabled: !!currentDeploymentId,
    }
  )

  const allLogsParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes: ['command', 'run'] as EventType[],
      from: 0,
      limit: 500,
    }),
    [vehicleName]
  )

  const allLogsResponse = useInfiniteEvents(allLogsParams)

  const { isLoading, isFetching, refetch } = deploymentLogsOnly
    ? deploymentResponse
    : allLogsResponse

  // Fetch recent mission-started events to derive real running/ended status.
  // The API returns them newest-first; index 0 = currently running mission.
  const missionStartedResponse = useMissionStartedEvent(
    { vehicle: vehicleName, limit: 50 },
    { enabled: !!vehicleName, staleTime: 30 * 1000 }
  )

  // Build a map of mission name → index in the mission-started list.
  // Index 0 = running, everything else = ended.
  const missionStatusMap = useMemo(() => {
    const map = new Map<string, 'running' | 'completed'>()
    missionStartedResponse.data?.forEach((evt, idx) => {
      const name = missionNameFromStartedText(evt.text)
      if (name && !map.has(name)) {
        map.set(name, idx === 0 ? 'running' : 'completed')
      }
    })
    return map
  }, [missionStartedResponse.data])

  const missions: CommandStatusItem[] = useMemo(() => {
    let items: CommandStatusItem[]

    if (deploymentLogsOnly) {
      const cs = deploymentResponse.data?.commandStatuses ?? []
      items = cs as unknown as CommandStatusItem[]
    } else {
      const pages = allLogsResponse.data?.pages ?? []
      const flat = pages.flat()
      items = flat.map((evt: GetEventsResponse) => ({
        event: {
          data: evt?.data,
          note: evt?.note,
          user: evt?.user,
          unixTime: evt?.unixTime,
          eventId: evt?.eventId,
          eventType: evt?.eventType,
          text: evt?.text,
        },
        status: 'TBD',
      }))
    }

    // Enrich each item's status using the mission-started sequence when
    // the backend still returns TBD for everything.
    const enriched = items.map((item) => {
      if (item.status !== 'TBD') return item
      const missionName = missionNameFromEventData(item.event.data)
      const derivedStatus = missionName
        ? missionStatusMap.get(missionName)
        : undefined
      return derivedStatus ? { ...item, status: derivedStatus } : item
    })

    // Inject the currently running mission at the top if it was auto-triggered
    // by MissionManager (not found in the operator command log).
    const currentMissionEvent = missionStartedResponse.data?.[0]
    if (currentMissionEvent) {
      const currentName = missionNameFromStartedText(currentMissionEvent.text)
      const alreadyInList = enriched.some(
        (item) => missionNameFromEventData(item.event.data) === currentName
      )
      if (!alreadyInList) {
        enriched.unshift({
          event: {
            data: currentMissionEvent.text,
            unixTime: currentMissionEvent.unixTime,
            eventId: currentMissionEvent.eventId,
            eventType: currentMissionEvent.eventType,
            text: currentMissionEvent.text,
          },
          status: 'running',
        })
      }
    }

    return enriched
  }, [
    deploymentLogsOnly,
    deploymentResponse.data,
    allLogsResponse.data,
    missionStatusMap,
    missionStartedResponse.data,
  ])

  const scheduledTypes = ['pending', 'running']
  const staticHeaderCellOffset = activeDeployment ? 1 : 0
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
  const baseTotalCellCount =
    results.length + staticFilterCellOffset + staticHeaderCellOffset
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = allLogsResponse
  const showLoadMore = !deploymentLogsOnly && !!hasNextPage
  const totalCellCount = baseTotalCellCount + (showLoadMore ? 1 : 0)

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

  const toggleSchedule = () => {
    setGlobalModalId({
      id: 'newCommand',
      meta: {
        command: scheduleStatus === 'paused' ? 'sched resume' : 'sched pause',
      },
    })
  }

  const handleLoadMore = () => {
    if (!deploymentLogsOnly) {
      fetchNextPage()
    }
  }

  const cellAtIndex = (index: number) => {
    if (index === 0 && activeDeployment) {
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
    if (showLoadMore && index === baseTotalCellCount) {
      return (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetchingNextPage}
          label="Load more logs"
        />
      )
    }
    const indexOffset =
      index < (indexOfPastSchedule ?? results?.length ?? 0)
        ? -staticHeaderCellOffset
        : -staticHeaderCellOffset - staticFilterCellOffset
    const mission = results[index + indexOffset]
    const { name: missionName, parameters: missionParams } =
      parseMissionCommand(mission?.event.data ?? '')

    return mission ? (
      <ScheduleCell
        label={missionName ?? 'Unknown'}
        secondary={missionParams ?? 'No parameters'}
        status={
          mission.status === 'TBD'
            ? 'completed'
            : toScheduleCellStatus(mission.status)
        }
        name={mission.event.user ?? 'Unknown'}
        scheduleStatus={
          (['pending', 'running'].includes(mission.status) && scheduleStatus) ||
          undefined
        }
        className="border-b border-stone-200"
        description={
          mission.event.unixTime
            ? `${
                ['pending', 'running'].includes(mission.status)
                  ? 'Started'
                  : 'Ended'
              } ${DateTime.fromMillis(mission.event.unixTime).toFormat('h:mm')}`
            : ''
        }
        description2={
          DateTime.fromMillis(mission.event.unixTime ?? 0).toRelative() ?? ''
        }
        onSelect={() => undefined}
        onMoreClick={openMoreMenu}
        eventId={mission.event.eventId}
        commandType={
          mission?.event?.eventType === 'run' ||
          isMissionCommand(mission?.event?.data, mission?.event?.text)
            ? 'mission'
            : 'command'
        }
      />
    ) : (
      <p className="mx-2 my-2 rounded bg-stone-100 p-2">No Data</p>
    )
  }

  const handleDuplicate = ({
    eventId,
    commandType,
  }: {
    eventId: number
    commandType: string
  }) => {
    const event = results.find((r) => r?.event.eventId === eventId)?.event

    // Check if this is actually a mission command based on content, not just commandType
    const isMission = isMissionCommand(event?.data, event?.text)

    if (commandType === 'mission' || isMission) {
      const missionPath =
        event?.data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/)?.[0] ??
        event?.text?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/)?.[0] ??
        ''
      setGlobalModalId({
        id: 'newMission',
        meta: {
          mission: missionPath,
          eventId: eventId,
          eventData: event?.data ?? event?.text ?? null,
          eventUser: event?.user ?? null,
          eventNote: event?.note ?? null,
          eventIsoTime: event?.unixTime
            ? new Date(event.unixTime).toISOString()
            : null,
          eventVehicleName: vehicleName,
        },
      })
    } else {
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

  const handleRefresh = () => {
    refetch()
  }

  return (
    <>
      <header className="flex justify-between p-2">
        <div className="flex">
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
        <LogsToolbar
          deploymentLogsOnly={deploymentLogsOnly}
          toggleDeploymentLogsOnly={toggleDeploymentLogsOnly}
          disabled={isLoading || isFetching}
          handleRefresh={handleRefresh}
        />
      </header>
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
