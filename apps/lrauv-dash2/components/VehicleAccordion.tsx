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
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import { ScheduleSection } from './ScheduleSection'

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
    from,
    to,
  })
  const earliestLog = relatedLogs?.[(relatedLogs?.length ?? 0) - 1]?.isoTime
  const logsSummary = logsLoading
    ? 'loading...'
    : earliestLog
    ? `started ${DateTime.fromISO(earliestLog).toRelative()}`
    : 'no logs yet'

  const [section, setSection] = useState<VehicleAccordionSection>('handoff')
  const handleToggleForSection =
    (currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : null)
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
      />
      {section === 'data' && (
        <ScienceDataSection from={from} to={to} vehicleName={vehicleName} />
      )}
      <AccordionHeader
        label="Schedule"
        secondaryLabel={
          activeDeployment ? 'Profile Station running for 12 mins' : ''
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
          activeDeployment ? 'surfacing in ~20 min, no items in queue' : ''
        }
        onToggle={handleToggleForSection('comms')}
        open={section === 'comms'}
        className="flex flex-shrink-0"
      />
      {section === 'comms' && (
        <CommsSection vehicleName={vehicleName} from={from} to={to} />
      )}
      <AccordionHeader
        label="Log"
        secondaryLabel={activeDeployment ? logsSummary : ''}
        onToggle={handleToggleForSection('log')}
        open={section === 'log'}
        className="flex flex-shrink-0"
      />
      {section === 'log' && (
        <LogsSection vehicleName={vehicleName} from={from} to={to} />
      )}
      <AccordionHeader
        label="Docs"
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
