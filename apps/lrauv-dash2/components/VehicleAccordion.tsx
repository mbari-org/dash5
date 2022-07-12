import { AccordionHeader } from '@mbari/react-ui'
import { useState } from 'react'
import CommsSection from './CommsSection'
import HandoffSection from './HandoffSection'
import ScienceDataSection from './ScienceDataSection'

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
}

const VehicleAccordion: React.FC<VehicleAccordionProps> = ({
  from,
  to,
  vehicleName,
  authenticated,
  activeDeployment,
}) => {
  const [section, setSection] = useState<VehicleAccordionSection>('handoff')
  const handleToggleForSection =
    (currentSection: VehicleAccordionSection) => (open: boolean) =>
      setSection(open ? currentSection : null)

  return (
    <div className="flex h-full flex-col divide-y divide-solid divide-stone-200">
      <AccordionHeader
        label="Handoff / On Call"
        secondaryLabel="Tanner P. (you) / Brian K."
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
        secondaryLabel="Updated 2 mins ago"
        onToggle={handleToggleForSection('data')}
        open={section === 'data'}
        className="flex flex-shrink-0"
      />
      {section === 'data' && (
        <ScienceDataSection from={from} to={to} vehicleName={vehicleName} />
      )}
      <AccordionHeader
        label="Schedule"
        secondaryLabel="Profile Station running for 12 mins"
        onToggle={handleToggleForSection('schedule')}
        open={section === 'schedule'}
        className="flex flex-shrink-0"
      />
      <AccordionHeader
        label="Comms Queue"
        secondaryLabel="surfacing in ~20 min, no items in queue"
        onToggle={handleToggleForSection('comms')}
        open={section === 'comms'}
        className="flex flex-shrink-0"
      />
      {section === 'comms' && (
        <CommsSection vehicleName={vehicleName} from={from} to={to} />
      )}
      <AccordionHeader
        label="Log"
        secondaryLabel="started 4h 7m ago"
        onToggle={handleToggleForSection('log')}
        open={section === 'log'}
        className="flex flex-shrink-0"
      />
      <AccordionHeader
        label="Docs"
        onToggle={handleToggleForSection('docs')}
        open={section === 'docs'}
        className="flex flex-shrink-0"
      />
    </div>
  )
}

export default VehicleAccordion
