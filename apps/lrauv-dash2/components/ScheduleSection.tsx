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
  getVia,
} from '@mbari/api-client'
import useGlobalModalId from '../lib/useGlobalModalId'
import {
  missionNameFromStartedText,
  missionPathFromEventData,
  normalizeMissionName,
  normalizeMissionPath,
} from '../lib/missionUtils'
import { formatElapsedTime } from '@mbari/utils'
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
  endedAt?: number
}

const VALID_SCHEDULE_CELL_STATUSES: ScheduleCellStatus[] = [
  'pending',
  'running',
  'cancelled',
  'completed',
  'paused',
]

const toScheduleCellStatus = (status: string): ScheduleCellStatus => {
  const s = status.trim().toLowerCase()
  if (s === 'tbd') return 'pending'
  return VALID_SCHEDULE_CELL_STATUSES.includes(s as ScheduleCellStatus)
    ? (s as ScheduleCellStatus)
    : 'pending'
}

const missionKeysMatch = (leftPath: string, rightPath: string) => {
  if (!leftPath || !rightPath) return false
  const leftHasPath = leftPath.includes('/')
  const rightHasPath = rightPath.includes('/')

  if (leftHasPath && rightHasPath) return leftPath === rightPath

  return normalizeMissionName(leftPath) === normalizeMissionName(rightPath)
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

/**
 * Detects if a command is actually a mission command by checking if it contains
 * "load" followed by a mission file path and "run"
 */
export const isMissionCommand = (
  commandData?: string,
  commandText?: string
): boolean => {
  const text = commandText || commandData || ''
  // Accept load paths with or without file extension.
  const hasLoad = /\bload\s+[A-Za-z0-9_/.-]+(?:\.(?:xml|tl))?\b/i.test(text)
  const hasRun = /\brun\b/i.test(text)
  return hasLoad && hasRun
}

// Detects parameter update commands: "set <missionName>.<paramName> <value>"
export const isParamCommand = (
  commandData?: string,
  commandText?: string
): boolean => {
  const text = commandData ?? commandText ?? ''
  return /^\s*set\s+\w+\.\w+/i.test(text)
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
  // The API returns newest-first: index 0 = currently running mission.
  // Poll every 30s so running→ended transitions appear without a page refresh.
  const missionStartedResponse = useMissionStartedEvent(
    { vehicle: vehicleName, limit: 50 },
    { enabled: !!vehicleName, staleTime: 15 * 1000, refetchInterval: 30 * 1000 }
  )

  // Build a timeline: each entry knows its own start time and when it ended
  // (= the start time of the mission that replaced it, or undefined if running).
  // events[0] = running  →  endedAt: undefined
  // events[i] = ended    →  endedAt: events[i-1].unixTime
  const missionTimeline = useMemo(() => {
    const events = missionStartedResponse.data ?? []
    return events.map((evt, idx) => ({
      name: missionNameFromStartedText(evt.text),
      startedAt: evt.unixTime,
      endedAt: idx > 0 ? events[idx - 1].unixTime : undefined,
      status: idx === 0 ? ('running' as const) : ('completed' as const),
    }))
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

    // Enrich each item's status/endedAt from mission-started events.
    // Priority:
    // 1) interval containment (startedAt <= eventTime < endedAt) for exact runs
    // 2) nearest-by-time within a small window as conservative fallback
    //
    // For pre-queued missions (sched TIMESTAMP "..."), use the scheduled start
    // time as the reference point instead of the command send time, since the
    // vehicle won't start until that time and the match window would otherwise
    // be too far off.
    const MATCH_WINDOW_MS = 10 * 60 * 1000

    const parseScheduledUnixTime = (
      data?: string,
      text?: string
    ): number | undefined => {
      const raw = data ?? text ?? ''
      // Format: 20260401}T0600 or 20260331T18 or 20260331T1800 (UTC)
      const m =
        raw.match(/sched\s+(\d{4})(\d{2})(\d{2})}T(\d{2})(\d{2})/) ||
        raw.match(/sched\s+(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})?/)
      if (!m) return undefined
      const dt = DateTime.fromObject(
        {
          year: parseInt(m[1]),
          month: parseInt(m[2]),
          day: parseInt(m[3]),
          hour: parseInt(m[4]),
          minute: m[5] ? parseInt(m[5]) : 0,
        },
        { zone: 'utc' }
      )
      return dt.isValid ? dt.toMillis() : undefined
    }

    const enriched = items.map((item) => {
      if (item.status !== 'TBD') return item
      const missionPath =
        missionPathFromEventData(item.event.data) ||
        missionPathFromEventData(item.event.text)
      if (!missionPath || item.event.unixTime == null) return item

      // Use scheduled time as reference if available, else fall back to send time
      const scheduledTime = parseScheduledUnixTime(
        item.event.data,
        item.event.text
      )
      const referenceTime = scheduledTime ?? item.event.unixTime

      const candidates = missionTimeline.filter((t) =>
        missionKeysMatch(normalizeMissionPath(t.name), missionPath)
      )
      if (!candidates.length) return item

      const inInterval = candidates.find(
        (candidate) =>
          referenceTime >= candidate.startedAt &&
          (candidate.endedAt == null || referenceTime < candidate.endedAt)
      )
      if (inInterval) {
        return {
          ...item,
          status: inInterval.status,
          endedAt: inInterval.endedAt,
        }
      }

      // Fallback: pick nearest timeline entry by start time.
      const best = candidates.reduce((prev, curr) =>
        Math.abs(curr.startedAt - referenceTime) <
        Math.abs(prev.startedAt - referenceTime)
          ? curr
          : prev
      )

      // Only enrich if within the match window to avoid false positives.
      if (Math.abs(best.startedAt - referenceTime) > MATCH_WINDOW_MS)
        return item

      return { ...item, status: best.status, endedAt: best.endedAt }
    })

    // Ensure the currently running mission is represented as running.
    // If it already exists but isn't marked running, promote that row to running.
    // Otherwise inject a synthetic running row at the top.
    const currentMissionEntry = missionTimeline[0]
    if (currentMissionEntry) {
      const currentMissionPath = normalizeMissionPath(currentMissionEntry.name)
      if (!currentMissionPath) return enriched

      const matchingMissionIndex = enriched.findIndex((item) => {
        const fromDataPath = missionPathFromEventData(item.event.data)
        const fromTextPath = missionPathFromEventData(item.event.text)
        return (
          missionKeysMatch(fromDataPath, currentMissionPath) ||
          missionKeysMatch(fromTextPath, currentMissionPath)
        )
      })

      if (matchingMissionIndex >= 0) {
        const matchingItem = enriched[matchingMissionIndex]
        if (matchingItem.status !== 'running') {
          enriched[matchingMissionIndex] = {
            ...matchingItem,
            status: 'running',
            endedAt: undefined,
          }
        }
      } else {
        const currentRawEvent = missionStartedResponse.data?.[0]
        if (currentRawEvent) {
          enriched.unshift({
            event: {
              // Construct a command-format data string so parseMissionCommand
              // produces a consistent label and "Use for new mission" receives
              // a valid path. GetMissionStartedEventResponse has no data field.
              data: `load ${currentMissionEntry.name};run`,
              unixTime: currentRawEvent.unixTime,
              eventId: currentRawEvent.eventId,
              eventType: 'run',
              text: currentRawEvent.text,
            },
            status: 'running',
            endedAt: undefined,
          })
        }
      }
    }

    // Promote any still-TBD rows that predate the currently running mission.
    // A row whose scheduled/send time is before the running mission started
    // was either already run (but not matched by name) or displaced — calling
    // it 'pending' indefinitely is misleading. Future-scheduled rows are safe:
    // their referenceTime (scheduled run time) will be after startedAt.
    const currentRunningStartedAt = missionTimeline[0]?.startedAt
    if (currentRunningStartedAt) {
      for (let i = 0; i < enriched.length; i++) {
        const item = enriched[i]
        if (item.status !== 'TBD') continue
        const scheduledTime = parseScheduledUnixTime(
          item.event.data,
          item.event.text
        )
        const referenceTime = scheduledTime ?? item.event.unixTime ?? 0
        if (referenceTime < currentRunningStartedAt) {
          enriched[i] = { ...item, status: 'completed' }
        }
      }
    }

    return enriched
  }, [
    deploymentLogsOnly,
    deploymentResponse.data,
    allLogsResponse.data,
    missionTimeline,
    missionStartedResponse.data,
  ])

  const scheduledTypes = ['pending', 'running']
  const staticHeaderCellOffset = activeDeployment ? 1 : 0
  const hasPastSchedule =
    missions?.some((v) => !scheduledTypes.includes(v.status)) ?? false
  const staticFilterCellOffset = hasPastSchedule ? 1 : 0
  const indexOfPastSchedule = staticHeaderCellOffset

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
        toScheduleCellStatus(v.status) === scheduleFilter
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
    // Find the most recent sched pause/resume command rather than relying on
    // missions[0], which may now be a synthetic mission-started injection.
    missions?.find(
      (m) => m.event.data === 'sched pause' || m.event.data === 'sched resume'
    )?.event.data === 'sched pause'
      ? 'paused'
      : 'running'

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
              ? 'bg-violet-100'
              : ScheduleCellBackgrounds.paused
          )}
        >
          <span className="my-auto mr-2 text-xs font-bold">
            {scheduleStatus === 'paused'
              ? 'Schedule is paused'
              : 'Schedule is running'}
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
          <span className="flex flex-col">
            <span className="text-xs font-bold">Schedule History</span>
            <span className="text-xs text-stone-500">
              NOTE: Ended times are approximate
              <br />
              Accuracy varies — see Logs for exact times
            </span>
          </span>
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
    // Filter bar is always at staticHeaderCellOffset, so all mission cells
    // need the full combined offset subtracted.
    const indexOffset = -(staticHeaderCellOffset + staticFilterCellOffset)
    const mission = results[index + indexOffset]
    const { name: missionName, parameters: missionParams } =
      parseMissionCommand(mission?.event.data ?? '')
    const isMission =
      mission?.event?.eventType === 'run' ||
      isMissionCommand(mission?.event?.data, mission?.event?.text)
    const isParam =
      !isMission && isParamCommand(mission?.event?.data, mission?.event?.text)
    const cellCommandType: 'mission' | 'command' = isMission
      ? 'mission'
      : 'command'
    const rawText = mission?.event.data ?? mission?.event.text ?? ''
    const schedDateMatch = rawText.match(/sched\s+(\d{8}}T\d{4}|\d{8}T\d{2,4})/)
    const scheduleDate = rawText.match(/sched\s+asap/i)
      ? 'asap'
      : schedDateMatch
      ? schedDateMatch[1]
      : undefined
    const cellStatus = isParam
      ? 'sent'
      : toScheduleCellStatus(mission?.status ?? '')

    return mission ? (
      <ScheduleCell
        label={missionName ?? 'Unknown'}
        secondary={missionParams ?? 'No parameters'}
        status={cellStatus}
        name={mission.event.user ?? 'Unknown'}
        scheduleStatus={
          (['pending', 'running'].includes(cellStatus) && scheduleStatus) ||
          undefined
        }
        className="border-b border-stone-200"
        description={(() => {
          if (mission.event.unixTime == null) return ''
          const dt = DateTime.fromMillis(mission.event.unixTime)
          const now = DateTime.now()
          const elapsedMs = now.toMillis() - dt.toMillis()
          const relativePart =
            elapsedMs >= 0 ? ` (${formatElapsedTime(elapsedMs)} ago)` : ''
          const isToday = dt.hasSame(now, 'day')
          const timeStr = isToday
            ? dt.toFormat('H:mm')
            : dt.toFormat('MMM d, H:mm')
          const verb = isParam ? 'Sent' : isMission ? 'Started' : 'Ran'
          return `${verb} ${timeStr}${relativePart}`
        })()}
        description2={
          isParam
            ? undefined
            : cellStatus === 'running' || cellStatus === 'pending'
            ? 'Ended: TBD'
            : mission.endedAt
            ? `Ended: ~${(() => {
                const endDt = DateTime.fromMillis(mission.endedAt)
                const isToday = endDt.hasSame(DateTime.now(), 'day')
                return isToday
                  ? endDt.toFormat('H:mm')
                  : endDt.toFormat('MMM d, H:mm')
              })()}`
            : 'Ended: N/A (see Logs)'
        }
        badge={
          isParam
            ? {
                text: 'config',
                tooltip: 'Config update — added to running mission',
              }
            : undefined
        }
        onSelect={() => {
          setGlobalModalId({
            id: 'scheduleEventDetails',
            meta: {
              scheduleEvent: {
                eventId: mission.event.eventId,
                commandType: cellCommandType,
                status: isParam ? 'sent' : mission.status,
                label: missionName ?? 'Unknown',
                secondary: missionParams ?? undefined,
                user: mission.event.user ?? undefined,
                note: mission.event.note ?? undefined,
                eventData: mission.event.data ?? undefined,
                eventText: mission.event.text ?? undefined,
                startedAt: mission.event.unixTime,
                endedAt: mission.endedAt,
                vehicleName,
                scheduleDate,
                via: getVia(mission.event.note) ?? undefined,
                isParamUpdate: isParam,
              },
            },
          })
        }}
        onMoreClick={openMoreMenu}
        eventId={mission.event.eventId}
        commandType={cellCommandType}
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
