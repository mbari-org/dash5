import { AccordionHeader } from '@mbari/react-ui'
import { useState } from 'react'
import CommsSection from './CommsSection'
import DocsSection from './DocsSection'
import HandoffSection from './HandoffSection'
import LogsSection from './LogsSection'
import ScienceDataSection from './ScienceDataSection'
import {
  useEvents,
  usePicAndOnCall,
  useTethysApiContext,
  useDeploymentCommandStatus,
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import { parseMissionCommand, ScheduleSection } from './ScheduleSection'
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
  from: string
  to?: string
  authenticated?: boolean
  activeDeployment?: boolean
  currentDeploymentId?: number
}

const shortenName = (name: string) =>
  name
    .split(' ')
    .reduce((acc, curr, idx) => `${acc} ${idx > 0 ? curr[0] : curr}.`, '')
    .trim()

const VehicleAccordion: React.FC<VehicleAccordionProps> = ({
  from,
  to,
  vehicleName,
  authenticated,
  activeDeployment,
  currentDeploymentId,
}) => {
  const { data: relatedLogs, isLoading: logsLoading } = useEvents({
    vehicles: [vehicleName],
    from: '',
    to: '',
  })
  const { data: commsLogs, isLoading: commsLoading } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['command', 'run'],
    from,
    to,
  })

  const { data: deploymentCommandStatus } = useDeploymentCommandStatus(
    {
      deploymentId: currentDeploymentId ?? 0,
    },
    {
      enabled: !!currentDeploymentId,
    }
  )
  const currentMission = deploymentCommandStatus?.commandStatuses
    ?.filter((s) => s.event.eventType === 'run')
    ?.sort((a, b) => a.event.unixTime - b.event.unixTime)?.[0]

  // const earliestLog = relatedLogs?.[(relatedLogs?.length ?? 0) - 1]?.isoTime
  // const logsSummary = logsLoading
  //   ? 'loading...'
  //   : earliestLog
  //   ? `started ${DateTime.fromISO(earliestLog).toRelative()}`
  //   : 'no logs yet'

  const [section, setSection] = useState<VehicleAccordionSection>('schedule')
  const handleToggleForSection =
    (currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : null)
  if (!currentMission) {
    ;(currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : 'comms')
  }

  const { data: picAndOnCall, isLoading: loadingPic } = usePicAndOnCall({
    vehicleName,
  })
  const { profile } = useTethysApiContext()
  const profileName = `${profile?.firstName} ${profile?.lastName}`
  const pic = picAndOnCall?.[0].pic?.user
  const onCall = picAndOnCall?.[0].onCall?.user
  const handoffLabel = loadingPic
    ? '...'
    : `${shortenName(pic ?? 'Unassigned')}${
        pic === profileName ? ' (you)' : ''
      } / ${shortenName(onCall ?? 'Unassigned')}${
        onCall === profileName ? ' (you)' : ''
      }`

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

  return (
    <div className="flex h-full flex-col divide-y divide-solid divide-stone-200">
      <AccordionHeader
        label="Handoff / On Call"
        secondaryLabel={activeDeployment ? handoffLabel : ''}
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
          activeDeployment && currentMission
            ? `${
                parseMissionCommand(currentMission.event.data ?? '').name ?? ''
              } running for ${DateTime.fromMillis(
                currentMission.event.unixTime ?? 0
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
        />
      )}
      <AccordionHeader
        label="Comms Queue"
        secondaryLabel={
          activeDeployment ? `${commsLogs?.length ?? 0} item(s) in queue` : ''
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
        // secondaryLabel={activeDeployment ? logsSummary : ''}
        onToggle={handleToggleForSection('log')}
        open={section === 'log'}
        className="flex flex-shrink-0"
        onExpand={handleExpand('logs')}
      />
      {section === 'log' && (
        <LogsSection vehicleName={vehicleName} from={from} to={to} />
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
