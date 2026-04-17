import React from 'react'
import { ResourcesDropdown } from '@mbari/react-ui'
import {
  faFileExcel,
  faFileWord,
  faFilePdf,
  faCalendar,
} from '@fortawesome/free-regular-svg-icons'
import { faLink } from '@fortawesome/free-solid-svg-icons'

interface LrauvResourcesDropdownProps {
  isAdmin?: boolean
}

const picLinks = [
  {
    label: 'Watchbill',
    url: 'https://docs.google.com/spreadsheets/d/1kOTNsOcUKWlfK1YHQAq38arX9HLQINzlpuR-vL6bCrE/edit?gid=0#gid=0',
    tooltip: 'Sign up to pilot an LRAUV!\n(earn a team LRAUV hat)',
    icon: faFileExcel,
  },
]

const resourceLinks = [
  {
    label: 'Quick Start',
    url: 'https://docs.google.com/document/d/1Zz2YIICPrde2mnisBAm5HdqWWHZYZQBc8aFEI6xznjw/edit#heading=h.higivngi7zbi',
    icon: faFileWord,
    tooltip: 'New to LRAUV ops? Start here.',
  },
  {
    label: 'Operator Reference',
    url: 'https://docs.google.com/document/d/1Zz2YIICPrde2mnisBAm5HdqWWHZYZQBc8aFEI6xznjw/edit?tab=t.0',
    icon: faFileWord,
    tooltip: 'Full LRAUV operator manual.',
  },
  {
    label: 'Cheat Sheet',
    url: 'https://docs.google.com/document/d/1Zz2YIICPrde2mnisBAm5HdqWWHZYZQBc8aFEI6xznjw/edit#heading=h.sowkigh89d94',
    icon: faFileWord,
    tooltip: 'Quick reference for common procedures.',
  },
  {
    label: 'Vehicle config worksheet',
    url: 'https://docs.google.com/document/d/1Twbd6JdawMxB70HlbMf_J4yhiv8exM1rjx4Tt55JLro/edit?tab=t.0',
    icon: faFileWord,
    tooltip: 'Vehicle-specific configuration details.',
  },
  {
    label: 'TethysDash Operation',
    url: 'https://docs.mbari.org/internal/tethysdash-ops-doc/',
    icon: faLink,
    tooltip: 'Guide to operating TethysDash.',
  },
  {
    label: 'MBARI Ops Calendar',
    url: 'https://mww2.shore.mbari.org/events/calendar.cgi',
    icon: faCalendar,
    tooltip: 'MBARI operational schedule — ships, wavegliders, and more.',
  },
]

const trainingLinks = [
  {
    label: 'Training Worksheet',
    url: 'https://acrobat.adobe.com/id/urn:aaid:sc:VA6C2:967b6aa8-2091-4308-9d3b-d0a5fd4fc3b1',
    icon: faFilePdf,
    tooltip: 'PIC training checklist and worksheet.',
  },
  {
    label: 'Operator Refresher Quiz',
    url: 'https://app.formative.com/formatives/65e67682e0a461df5f93b635',
    icon: faLink,
    tooltip: 'Test your LRAUV knowledge.',
  },
]

const adminLinks = [
  {
    label: 'Frontend Configuration',
    disabled: true as const,
  },
]

const LrauvResourcesDropdown: React.FC<LrauvResourcesDropdownProps> = ({
  isAdmin = false,
}) => (
  <ResourcesDropdown
    picLinks={picLinks}
    resourceLinks={resourceLinks}
    resourcesSectionLabel="Resources"
    trainingLinks={trainingLinks}
    trainingSectionLabel="Operator Training"
    adminLinks={adminLinks}
    isAdmin={isAdmin}
  />
)

export default LrauvResourcesDropdown
