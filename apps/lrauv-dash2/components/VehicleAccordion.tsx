import { AccordionHeader } from '@mbari/react-ui'
import { useState, useMemo } from 'react'
import CommsSection from './CommsSection'
import DocsSection from './DocsSection'
import HandoffSection from './HandoffSection'
import LogsSection from './LogsSection'
import ScienceDataSection from './ScienceDataSection'
import {
  useCommsEvents,
  useMissionStartedEvent,
  useEvents,
  timeoutExpiredRegEx,
  EventType,
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import { ScheduleSection } from './ScheduleSection'
import useGlobalModalId from '../lib/useGlobalModalId'
export type VehicleAccordionSection =
  | 'handoff'
  | 'data'
  | 'schedule'
  | 'comms'
  | 'log'
  | 'docs'
  | null

export interface VehicleAccordionProps {
  vehicleName: string
  from: number
  to?: number
  picLabel?: string
  onCallLabel?: string
  authenticated?: boolean
  activeDeployment?: boolean
  currentDeploymentId?: number
  isRecovered?: boolean
}

const VehicleAccordion: React.FC<VehicleAccordionProps> = ({
  from,
  to,
  vehicleName,
  picLabel,
  onCallLabel,
  authenticated,
  activeDeployment,
  currentDeploymentId,
  isRecovered,
}) => {
  // Use from:0 (all history) so the badge shares the same React Query cache
  // entry as CommsSection's allLogsResponse — identical params mean both see
  // the same sbdSend/sbdReceipt/sbdReceive chain and agree on every status.
  // Using the deployment-scoped query (from: deploymentStartTime) produced a
  // different cache entry where receipts sometimes fell outside the fetch window,
  // causing a command to show 'ack' in the list but still 'sent' in the badge.
  const { data: commsEvents, isLoading: commsLoading } = useCommsEvents({
    vehicles: [vehicleName],
    from: 0,
    enabled: !!activeDeployment,
  })

  // Fetch all timeout notes across full history so older timed-out commands
  // are not miscounted as 'sent' when commsEvents pagination hasn't reached
  // their timeout note (same fix applied to ScheduleSection in PR #611).
  const timeoutNotesResponse = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['note'] as EventType[],
      noteMatches: 'Timeout while waiting',
      from: 1,
      limit: 500,
    },
    {
      enabled: !!activeDeployment && !!vehicleName,
      // from: 1 triggers recursive backfill on every refetch. Historical timeout
      // notes only ever accumulate — they are never removed — so fetch once per
      // session (Infinity staleTime, no interval). New timeouts are captured by
      // the commsEvents query which runs on its own polling schedule.
      staleTime: Infinity,
    }
  )

  const timedOutEventIds = useMemo(() => {
    const ids = new Set<number>()
    timeoutNotesResponse.data?.forEach((note) => {
      const match = note.note?.match(timeoutExpiredRegEx)
      if (match) ids.add(parseInt(match[1], 10))
    })
    return ids
  }, [timeoutNotesResponse.data])

  // Count commands genuinely waiting for vehicle receipt: 'queued' (not yet
  // dispatched via SBD) and 'sent' (dispatched but no vehicle fetch confirmed).
  // 'ack' and 'timeout' are excluded — the vehicle has already dealt with them.
  // Scope to the current deployment window (from/to) so commands from prior
  // deployments — which may legitimately never have been acked — don't inflate
  // the badge. commsEvents uses from:0 to share the React Query cache with
  // CommsSection, so we filter by unixTime (ms) here instead.
  const unackedCount = useMemo(
    () =>
      commsEvents.filter((e) => {
        const inDeployment = e.unixTime >= from && (!to || e.unixTime <= to)
        return (
          inDeployment &&
          (e.status === 'queued' || e.status === 'sent') &&
          !timedOutEventIds.has(e.eventId)
        )
      }).length,
    [commsEvents, timedOutEventIds, from, to]
  )

  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: vehicleName,
      limit: 1,
    },
    {
      enabled: !!activeDeployment,
    }
  )

  // The mission started event text is always in the format "Started mission <mission name>"
  const currentMissionText = missionStartedEvent?.[0]?.text ?? ''

  const [section, setSection] = useState<VehicleAccordionSection>(null)
  const handleToggleForSection =
    (currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : null)

  if (!currentMissionText || !activeDeployment) {
    ;(currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : 'comms')
  }

  const handoffLabel =
    (picLabel || onCallLabel) && authenticated
      ? `${!!picLabel ? picLabel : 'Unassigned'} / ${
          !!onCallLabel ? onCallLabel : 'Unassigned'
        }`
      : undefined

  const { setGlobalModalId } = useGlobalModalId()
  const handleExpand = (section: string) => () => {
    switch (section) {
      case 'logs':
        setGlobalModalId({ id: 'vehicleLogs' })
        break
      case 'docs':
        setGlobalModalId({ id: 'vehicleDocs' })
        break
      case 'charts':
        setGlobalModalId({ id: 'vehicleCharts' })
        break
      case 'comms':
        setGlobalModalId({ id: 'vehicleComms' })
        break
      default:
        break
    }
  }

  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(false)

  return (
    <div className="flex h-full flex-col divide-y divide-solid divide-stone-200">
      <AccordionHeader
        label="Handoff / On-Call"
        secondaryLabel={handoffLabel}
        onToggle={handleToggleForSection('handoff')}
        open={section === 'handoff'}
        className="flex flex-shrink-0"
      />
      {section === 'handoff' && (
        <HandoffSection
          from={from}
          to={to}
          authenticated={authenticated}
          vehicleName={vehicleName}
          activeDeployment={activeDeployment}
        />
      )}
      <AccordionHeader
        label="Science and vehicle data"
        secondaryLabel={activeDeployment ? 'Updated 2 mins ago' : ''}
        onToggle={handleToggleForSection('data')}
        open={section === 'data'}
        className="flex flex-shrink-0"
        onExpand={handleExpand('charts')}
      />
      {section === 'data' && (
        <ScienceDataSection from={from} to={to} vehicleName={vehicleName} />
      )}
      <AccordionHeader
        label="Schedule"
        secondaryLabel={
          activeDeployment && currentMissionText
            ? `${currentMissionText} ${DateTime.fromMillis(
                missionStartedEvent?.[0]?.unixTime ?? 0
              ).toRelative()}`
            : ''
        }
        onToggle={handleToggleForSection('schedule')}
        open={section === 'schedule'}
        className="flex flex-shrink-0"
      />
      {section === 'schedule' && (
        <ScheduleSection
          currentDeploymentId={currentDeploymentId}
          vehicleName={vehicleName}
          activeDeployment={activeDeployment}
          deploymentStartTime={from}
          isRecovered={isRecovered}
        />
      )}
      <AccordionHeader
        label="Comms Queue"
        secondaryLabel={
          activeDeployment && !commsLoading
            ? `${unackedCount} item(s) in queue`
            : ''
        }
        onToggle={handleToggleForSection('comms')}
        open={section === 'comms'}
        className="flex flex-shrink-0"
        onExpand={handleExpand('comms')}
      />
      {section === 'comms' && (
        <CommsSection
          vehicleName={vehicleName}
          from={from}
          to={to}
          timedOutEventIds={timedOutEventIds}
        />
      )}
      <AccordionHeader
        label="Log"
        secondaryLabel={
          section === 'log'
            ? deploymentLogsOnly
              ? 'showing deployment logs'
              : 'showing all logs'
            : ''
        }
        onToggle={handleToggleForSection('log')}
        open={section === 'log'}
        className="flex flex-shrink-0"
        onExpand={handleExpand('logs')}
      />
      {section === 'log' && (
        <LogsSection
          vehicleName={vehicleName}
          from={from}
          to={to}
          deploymentLogsOnly={deploymentLogsOnly}
          setDeploymentLogsOnly={setDeploymentLogsOnly}
        />
      )}
      <AccordionHeader
        label="Docs"
        onExpand={handleExpand('docs')}
        onToggle={handleToggleForSection('docs')}
        open={section === 'docs'}
        className="flex flex-shrink-0"
      />
      {section === 'docs' && (
        <DocsSection
          authenticated={authenticated}
          vehicleName={vehicleName}
          currentDeploymentId={currentDeploymentId}
        />
      )}
    </div>
  )
}

export default VehicleAccordion
