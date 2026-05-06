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
  // Only fetch comms events for active deployments — the queue count label
  // is hidden for historical deployments so there's no need to load the data
  const { data: commsEvents, isLoading: commsLoading } = useCommsEvents({
    vehicles: [vehicleName],
    from,
    to,
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
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
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
  // Exclude anything with a timeout note — commsEvents pagination may not have
  // fetched the note yet, leaving the command as 'sent' when it has in fact
  // already timed out (timedOutEventIds covers the full history via useEvents).
  const unackedCount = useMemo(
    () =>
      commsEvents.filter(
        (e) =>
          (e.status === 'queued' || e.status === 'sent') &&
          !timedOutEventIds.has(e.eventId)
      ).length,
    [commsEvents, timedOutEventIds]
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
        <CommsSection vehicleName={vehicleName} from={from} to={to} />
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
