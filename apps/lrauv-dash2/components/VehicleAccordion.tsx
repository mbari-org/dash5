import { AccordionHeader } from '@mbari/react-ui'
import { useState } from 'react'
import HandoffSection from './HandoffSection'

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
}

const VehicleAccordion: React.FC<VehicleAccordionProps> = ({
  from,
  to,
  vehicleName,
}) => {
  const [section, setSection] = useState<VehicleAccordionSection>('handoff')
  const handleToggleForSection =
    (currentSection: VehicleAccordionSection) => (open: boolean) => {
      console.log('toggleSection', currentSection, open)
      setSection(open ? currentSection : null)
    }
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
        <HandoffSection from={from} to={to} vehicleName={vehicleName} />
      )}
      <AccordionHeader
        label="Science and vehicle data"
        secondaryLabel="Updated 2 mins ago"
        onToggle={handleToggleForSection('data')}
        open={section === 'data'}
        className="flex flex-shrink-0"
      />
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